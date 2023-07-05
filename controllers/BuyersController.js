import Buyers from '../schemas/BuyersSchema';
import JWT from 'jsonwebtoken';
import argon2 from 'argon2';
import getCord from '../utilities/getcordinates';
import * as geolib from 'geolib';
import https from 'https';

class BuyersController {
    static RegBuyer = async (req, res, next) => {
        try {
            const {email, password, full_name, phone_number, city_id, address} = req.body;
            const {JWT_SECRET} = process.env;
            // await validateEmail(email);
            // await validateName(full_name);
            // await validateNumber(phone_number);
            // await validatePassword(password);
            const hashPassword = await argon2.hash(password);
            const user = await Buyers.findOne({
                email: email
            }, '-password');

            // IF (EXISTS) CHECK
            if (user) {
                res.status(400).json({
                    error: 'Пользователь с таким логином (e-mail) уже существует.'
                })
            }


            // IF (NOT_EXISTS) CHECK
            if (!user) {
                const newUser = new Buyers({
                    email: email,
                    password: hashPassword,
                    full_name: full_name,
                    phone_number: phone_number,
                    city_id: city_id,
                    address: address
                })
                await newUser.save();
                const user = await Buyers.findOne({
                    email: email
                }, '-password');
                const token = JWT.sign({
                    email: email,
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
            const {email, password} = req.body;
            const {JWT_SECRET} = process.env;
            const user = await Buyers.findOne({
                email: email
            });
            if (!user) {
                res.status(400).json({
                    error: 'Пользователь не найден.'
                })
            }
            const match = await argon2.verify(user.password, password);
            if (!match) {
                res.status(400).json({
                    error: 'Введён неправильный пароль.'
                })
            }
            const token = JWT.sign({
                email: email,
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
            const {full_name, significant_dates, phone_number} = req.body;

            await Buyers.updateOne({
                _id: user_id
            }, {
                $set: {
                    full_name: full_name,
                    significant_dates: significant_dates,
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

    // static GetCords = async (req, res, next) => {
    //     try {
    //         const { address } = req.body;
    //         const result = await getCord(address);
    //         const lat = result[0][0].lat;
    //         const lon = result[0][0].lon;
    //         const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    //         const response = await new Promise((resolve, reject) => {
    //             https.get(url, (res) => {
    //                 const { statusCode } = res;
    //                 if (statusCode !== 200) {
    //                     reject(new Error(`Request failed with status code ${statusCode}`));
    //                 }
    //
    //                 let data = '';
    //                 res.on('data', (chunk) => {
    //                     data += chunk;
    //                 });
    //
    //                 res.on('end', () => {
    //                     resolve(data);
    //                 });
    //             });
    //         });
    //         const nearbyAddresses = JSON.parse(response).address;
    //         res.status(200).json({
    //             Ширина: lat,
    //             Долгота: lon,
    //             Ближайшие_адреса: nearbyAddresses
    //         });
    //     } catch (e) {
    //         e.status = 401;
    //         next(e);
    //     }
    // }

    //!!!!!!!!!!!!!!!!! DELETE
//     static TerminateAll = async (req, res, next) => {
//         try {
//             await Cities.deleteMany({
//                 is_active: false
//             });
//             res.status(200).json({
//                 message: 'ok'
//             })
//         } catch (e) {
//             e.status = 401;
//             next(e)
//         }
//     }
}

export default BuyersController;
