import Sellers from '../schemas/SellersSchema';
import JWT from 'jsonwebtoken';
import argon2 from 'argon2';
import Stores from '../schemas/StoresSchema';
import mongoose from 'mongoose';

//
class SellersController {
    static RegSeller = async (req, res, next) => {
        try {
            const {name, email, password, inn, ip, ogrn, legal_name, phone_number, bill_number} = req.body;
            const JWT_SECRET = process.env.JWT_SECRET;
            // await validateEmail(email);
            // await validatePassword(password);
            // await validateNumber(phone_number);
            // await validateIp(ip);
            // await validateOgrn(ogrn);
            // await validateInn(inn);
            // await validateStoreTitle(legal_name)
            const hashPassword = await argon2.hash(password);
            const seller = await Sellers.findOne({
                inn: inn,
                phone_number: phone_number
            });
            if (seller) {
                res.status(400).json({
                    error: 'Страница с такими данными уже существует. Если вы забыли пароль, то свяжитесь с администрацией.'
                })
            }
            if (!seller) {
                const newSeller = new Sellers({
                    name: name,
                    email: email,
                    password: hashPassword,
                    inn: inn,
                    ip: ip,
                    ogrn: ogrn,
                    legal_name: legal_name,
                    bill_number: bill_number,
                    phone_number: phone_number,
                    status: 'pending',
                    message_from_admin: null,
                    subscription_status: null,
                    subscription_valid_until: null
                })
                await newSeller.save();
                const seller = await Sellers.findOne({
                    email: email,
                    inn: inn,
                    ip: ip,
                    ogrn: ogrn,
                    phone_number: phone_number
                }, '-password');
                const token = JWT.sign({
                    email: seller.email,
                    phone_number: seller.phone_number,
                    user_id: seller._id,
                    isSeller: true
                }, JWT_SECRET)
                res.status(200).json({
                    message: 'Страница успешно создана.',
                    token: token,
                    user_data: seller
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static LoginSeller = async (req, res, next) => {
        try {
            const {email, password} = req.body;
            const {JWT_SECRET} = process.env;
            const seller = await Sellers.findOne({
                email: email
            })
                .populate('active_store')
            if (!seller) {
                res.status(400).json({
                    error: 'Пользователь не найден.'
                })
            }
            const match = await argon2.verify(seller.password, password);
            if (!match) {
                res.status(400).json({
                    error: 'Введён неправильный пароль.'
                })
            }
            const store = await Stores.find({
                seller_user_id: seller._id
            }).populate('city_id')
            const token = JWT.sign({
                email: email,
                user_id: seller._id,
                isSeller: true
            }, JWT_SECRET);
            res.status(200).json({
                token: token,
                storesList: store,
                user_data: seller,
                isSeller: true
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static SellerProfile = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                return res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                });
            }
            const {user_id} = req;
            const storeCheck = await Stores.find({
                seller_user_id: user_id
            }).populate('city_id');
            const seller = await Sellers.findOne({
                _id: user_id
            });

            if (!storeCheck) {
                return res.status(400).json({
                    error: 'У вас нет магазинов'
                });
            }

            if (!seller.active_store) {
                if (storeCheck.length >= 2) {
                    const newActiveStoreId = storeCheck[0]._id;
                    await Sellers.findOneAndUpdate(
                        {_id: user_id},
                        {active_store: newActiveStoreId}
                    );
                } else if (storeCheck.length === 1) {
                    const newActiveStoreId = storeCheck[0]._id;
                    await Sellers.findOneAndUpdate(
                        {_id: user_id},
                        {active_store: newActiveStoreId}
                    );
                }
            }

            const user_data = await Sellers.findOne({
                _id: user_id
            }).populate({
                path: 'active_store',
                populate: {
                    path: 'city_id'
                }
            });

            return res.status(200).json({
                user_data,
                storesList: storeCheck,
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    };
    //
    static UpdateProfile = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const {user_id} = req;
            const {name, inn, ip, ogrn, legal_name, phone_number, bill_number} = req.body;
            // if (password) {
            //     await validatePassword(password);
            // }
            // if (phone_number) {
            //     await validateNumber(phone_number);
            // }
            // if (ip) {
            //     await validateIp(ip);
            // }
            // if (ogrn) {
            //     await validateOgrn(ogrn);
            // }
            // if (inn) {
            //     await validateInn(inn);
            // }
            // if (legal_name) {
            //     await validateStoreTitle(legal_name);
            // }
            await Sellers.findByIdAndUpdate({
                _id: user_id
            }, {
                $set: {
                    name: name,
                    inn: inn,
                    ip: ip,
                    ogrn: ogrn,
                    legal_name: legal_name,
                    phone_number: phone_number,
                    bill_number: bill_number,
                }
            });
            const user_data = await Sellers.findOne({
                _id: user_id
            });
            res.status(200).json({
                user_data
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static UpdatePassword = async (req, res, next) => {
        try {
            const {user_id} = req;
            const seller = await Sellers.findById({
                _id: user_id
            });
            const {oldPassword, confPassword, newPassword} = req.body;
            const match = await argon2.verify(seller.password, oldPassword);
            if (match) {
                if (newPassword !== confPassword) {
                    res.status(400).json({
                        error: 'Пароли не совпадают.'
                    })
                }
                if (newPassword === confPassword) {
                    const encrypted = await argon2.hash(newPassword);
                    await Sellers.findByIdAndUpdate({
                        _id: user_id
                    }, {
                        password: encrypted
                    })
                }
                res.status(200).json({
                    message: 'success'
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static DeleteProfile = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const {user_id} = req;
            await Sellers.findByIdAndDelete({
                _id: user_id
            });
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetSub = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {until} = req.body;
            if (!until) {
                res.status(400).json({
                    error: 'Что-то пошло не так. Свяжитесь с администрацией.'
                })
            }
            if (until) {
                await Sellers.findByIdAndUpdate({
                    _id: user_id
                }, {
                    $set: {
                        subscription_valid_until: until,
                        subscription_status: 'active'
                    }
                });
            }
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static AddStoreToActive = async (req, res, next) => {
        try {
            const {store_id} = req.query;
            const {user_id} = req;
            const store = await Stores.findById({
                _id: store_id
            })
            const matchId = store.seller_user_id.toString();
            console.log(matchId)
            if (matchId !== user_id) {
                res.status(400).json({
                    error: 'Этот магазин не принадлежит данному пользователю.'
                })
            } else {
                await Sellers.findByIdAndUpdate({
                    _id: user_id
                }, {
                    active_store: store_id
                });
                res.status(200).json({
                    message: 'success'
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static DenySecondAttempt = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {name, email, password, inn, ip, ogrn, legal_name, phone_number, bill_number} = req.body;
            const userObj = mongoose.Types.ObjectId(user_id);
            console.log(userObj)
            await Sellers.findOneAndUpdate({
                _id: user_id
            }, {
                name: name,
                email: email,
                password: password,
                inn: inn,
                ip: ip,
                ogrn: ogrn,
                legal_name: legal_name,
                phone_number: phone_number,
                bill_number: bill_number,
                status: 'pending'
            });
            const sellerCheck = await Sellers.findOne({
                _id: user_id,
            });
            if (!sellerCheck) {
                res.status(400).json({
                    error: 'Такого пользователя нет в базе данных'
                })
            }
            res.status(200).json(sellerCheck);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default SellersController;
