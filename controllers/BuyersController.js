import Buyers from '../schemas/BuyersSchema';
import JWT from 'jsonwebtoken';

class BuyersController {
    static RegBuyer = async (req, res, next) => {
        try {
            const {
                phone_number,
                full_name
            } = req.body;
            const {JWT_SECRET} = process.env;
            // await validateName(full_name);
            // await validateNumber(phone_number);
            const user = await Buyers.findOne({
                phone_number: phone_number
            }, '-password');

            // IF (EXISTS) CHECK
            if (user) {
                res.status(400).json({
                    error: 'Пользователь с таким номером телефона уже существует.'
                })
            }
            // IF (NOT_EXISTS) CHECK
            if (!user) {
                const newUser = new Buyers({
                    phone_number: phone_number,
                    full_name: full_name
                })
                await newUser.save();
                const user = await Buyers.findOne({
                    phone_number: phone_number
                }, '-password');
                const token = JWT.sign({
                    phone_number: phone_number,
                    user_id: user._id
                }, JWT_SECRET)
                res.status(200).json({
                    token: token,
                    user_data: user
                })
            }
            //

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
