import Sellers from '../schemas/SellersSchema';
import JWT from 'jsonwebtoken';
import fs from 'fs';

import {
    validateEmail,
    validateInn,
    validateIp,
    validateNumber,
    validateOgrn,
    validatePassword,
    validateStoreTitle
} from '../middlewares/validate';
import argon2 from 'argon2';

class SellersController {
    static RegSeller = async (req, res, next) => {
        try {
            const {email, password, inn, ip, ogrn, stores_title, phone_number, bill_number} = req.body;
            const JWT_SECRET = process.env.JWT_SECRET;
            await validateEmail(email);
            await validatePassword(password);
            await validateNumber(phone_number);
            await validateIp(ip);
            await validateOgrn(ogrn);
            await validateInn(inn);
            await validateStoreTitle(stores_title)
            const hashPassword = await argon2.hash(password);
            const seller = await Sellers.findOne({
                inn: inn,
                phone_number: phone_number
            });
            if (seller) {
                if (req.files && req.files.length > 0) {
                    const logoFile = req.files.find(file => file.fieldname === 'logo');
                    const headerPhotoFile = req.files.find(file => file.fieldname === 'header_photo');

                    if (logoFile) {
                        fs.unlinkSync(logoFile.path);
                    }
                    if (headerPhotoFile) {
                        fs.unlinkSync(headerPhotoFile.path);
                    }
                }
                //
                res.status(400).json({
                    error: 'seller_already_exists',
                    message: 'Страница с такими данными уже существует. Если вы забыли пароль, то свяжитесь с администрацией.'
                })
            }
            if (!seller) {
                const logoFile = req.files.find(file => file.fieldname === 'logo');
                const headerPhotoFile = req.files.find(file => file.fieldname === 'header_photo');
                //
                const logoFileFn = `${logoFile.destination + logoFile.filename}`
                const headerPhotoFileFn = `${headerPhotoFile.destination + headerPhotoFile.filename}`
                //

                const newSeller = new Sellers({
                    email: email,
                    password: hashPassword,
                    inn: inn,
                    ip: ip,
                    ogrn: ogrn,
                    stores_title: stores_title,
                    bill_number: bill_number,
                    phone_number: phone_number,
                    status: 'pending',
                    message_from_admin: null,
                    logo_url: logoFileFn,
                    header_photo_url: headerPhotoFileFn,
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
            });
            if (!seller) {
                res.status(400).json({
                    error: 'user_not_found',
                    description: 'Пользователь не найден.'
                })
            }
            const match = await argon2.verify(seller.password, password);
            if (!match) {
                res.status(400).json({
                    error: 'wrong_password',
                    description: 'Введён неправильный пароль.'
                })
            }
            const token = JWT.sign({
                email: email,
                user_id: seller._id,
                isSeller: true
            }, JWT_SECRET);
            res.status(200).json({
                token: token,
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
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const {user_id} = req;
            const user_data = await Sellers.findOne({
                _id: user_id
            });
            console.log(user_id)
            res.status(200).json({
                user_data
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static UpdateProfile = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const {user_id} = req;
            const {password, inn, ip, ogrn, store_title, phone_number, bill_number} = req.body;
            if (password) {
                await validatePassword(password);
            }
            if (phone_number) {
                await validateNumber(phone_number);
            }
            if (ip) {
                await validateIp(ip);
            }
            if (ogrn) {
                await validateOgrn(ogrn);
            }
            if (inn) {
                await validateInn(inn);
            }
            if (store_title) {
                await validateStoreTitle(store_title);
            }
            const logoFile = req.files.find(file => file.fieldname === 'logo');
            const headerPhotoFile = req.files.find(file => file.fieldname === 'header_photo');
            const logoFileFn = `${logoFile.destination + logoFile.filename}`
            const headerPhotoFileFn = `${headerPhotoFile.destination + headerPhotoFile.filename}`
            await Sellers.findByIdAndUpdate({
                _id: user_id
            }, {
                $set: {
                    password: password,
                    inn: inn,
                    ip: ip,
                    ogrn: ogrn,
                    store_title: store_title,
                    phone_number: phone_number,
                    bill_number: bill_number,
                    logo: logoFileFn,
                    header_photo: headerPhotoFileFn
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
    static DeleteProfile = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
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
                    error: 'unexpected_error',
                    message: 'Что-то пошло не так. Свяжитесь с администрацией.'
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
}

export default SellersController;
