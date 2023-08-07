import Buyers from '../schemas/BuyersSchema';
import JWT from 'jsonwebtoken';
import makeCall from '../utilities/call';

class BuyersController {
    static code;
    static phone_number;
    static RegBuyer = async (req, res, next) => {
        try {
            const {phone_number, confCode} = req.body;
            const buyer = await Buyers.findOne({
                phone_number
            });
            if (confCode !== buyer.code) {
                res.status(301).json({
                    error: 'Неправильный код. Повторите попытку'
                })
            }
            if (confCode === buyer.code) {
                await Buyers.findOneAndUpdate({
                    phone_number: phone_number,
                    code: null
                })
                res.status(200).json({
                    message: 'Успешно'
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static ConfirmAndReg = async (req, res, next) => {
        try {
            const {phone_number} = req.body;
            const buyer = await Buyers.findOne({
                phone_number: phone_number
            })
            if (buyer) {
                res.status(301).json({
                    error: 'Такой номер уже существует'
                })
            }
            function generateRandomNumberString() {
                let result = '';
                for (let i = 0; i < 4; i++) {
                    const randomNumber = Math.floor(Math.random() * 10); // Генерируем случайное число от 0 до 9
                    result += randomNumber.toString();
                }
                return result;
            }

            const code = generateRandomNumberString();
            await makeCall(phone_number, code)
            const newBuyer = new Buyers({
                phone_number: phone_number,
                code: code,
                number_activated: false
            })
            await newBuyer.save();
            res.status(200).json({
                message: 'Скоро вам поступит звонок. Нужно ввести последние 4 цифры.'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static LoginBuyer = async (req, res, next) => {
        try {
            const {phone_number} = req.body;
            const {JWT_SECRET} = process.env;
            const user = await Buyers.findOne({
                phone_number: phone_number
            });
            if (!user) {
                res.status(400).json({
                    error: 'Пользователь не найден.'
                })
            }
            const token = JWT.sign({ //
                phone_number: phone_number,
                user_id: user._id
            }, JWT_SECRET);
            res.status(200).json({
                token: token,
                user_data: user
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static UserProfile = async (req, res, next) => {
        try {
            const {user_id} = req;
            const user = await Buyers.findOne({
                _id: user_id
            }, '-password');
            res.status(200).json({
                user_data: {
                    user
                }
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static UpdateProfile = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {full_name, phone_number} = req.body;

            await Buyers.updateOne({
                _id: user_id
            }, {
                $set: {
                    full_name: full_name,
                    phone_number: phone_number
                }
            })
            const user = await Buyers.findOne({
                _id: user_id
            })
            res.status(200).json({
                user_data: {
                    user
                }
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static DeleteProfile = async (req, res, next) => {
        try {
            const {user_id} = req;
            await Buyers.deleteOne({
                _id: user_id
            });
            res.status(200).json({
                message: 'Пользователь успешно удалён.'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static ChangeGeostatus = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {lon, lat} = req.query;
            const {address, city} = req.body;
            console.log(`Широта: ${lat} Долгота: ${lon}`)
            await Buyers.findOneAndUpdate({
                _id: user_id
            }, {
                lon: lon,
                lat: lat,
                address: address,
                city: city
            });
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default BuyersController;
