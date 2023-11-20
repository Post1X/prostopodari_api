import Buyers from '../schemas/BuyersSchema';
import JWT from 'jsonwebtoken';
import makeCall from '../utilities/call';
import Favorites from '../schemas/FavoritesSchema';
import findCity from '../utilities/cities';

// import {checkIfInside} from '../utilities/radius';

class BuyersController {
    static RegBuyer = async (req, res, next) => {
        try {
            const JWT_SECRET = process.env.JWT_SECRET;
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
                    phone_number: phone_number
                }, {
                    code: null
                })
                const token = JWT.sign({ //
                    phone_number: phone_number,
                    user_id: buyer._id
                }, JWT_SECRET);
                res.status(200).json({
                    token: token,
                    user_data: buyer
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

            function generateRandomNumberString() {
                let result = '';
                for (let i = 0; i < 4; i++) {
                    const randomNumber = Math.floor(Math.random() * 10);

                    result += randomNumber.toString();
                }
                return result;
            }

            const code = generateRandomNumberString();
            await makeCall(phone_number, code)
            if (!buyer) {
                const newBuyer = new Buyers({
                    phone_number: phone_number,
                    code: code,
                    number_activated: false
                })
                await newBuyer.save();
            }
            if (buyer) {
                await Buyers.findOneAndUpdate({
                    phone_number: phone_number
                }, {
                    code: code
                })
            }
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
            const {city, address, addressAll} = req.body;
            console.log(city, 'city')
            console.log(address, 'address')
            console.log(addressAll, 'addressAll')
            await Buyers.findOneAndUpdate({
                _id: user_id
            }, {
                city: city,
                address: address
            });
            const favorites = await Favorites.find({
                user_id: user_id
            }).populate('store_id')
            const promise = favorites.map(async (item) => {
                try {
                    if (city === item.store_id.city) {
                        await Favorites.updateOne({
                            _id: item.id
                        }, {
                            delivery: true
                        })
                    }
                    if (city !== item.store_id.city) {
                        await Favorites.updateOne({
                            _id: item.id
                        }, {
                            delivery: false
                        })
                    }
                } catch (e) {
                    e.status = 401;
                    next(e);
                }
            })
            await Promise.all(promise)
            res.status(200).json({
                message: 'ok'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static findCity = async (req, res, next) => {
        try {
            const {city} = req.query;
            let id = 0;
            const response = await findCity(city);
            const cities = response
                .filter((item) => item.tags.includes('province') || item.tags.includes('locality'))
                .map((item) => ({
                    id: (id += 1),
                    city: item.title.text,
                }));
            res.status(200).json(
                cities
            );
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default BuyersController;
