import jwt from 'jsonwebtoken';
import Sellers from '../schemas/SellersSchema';
import Reports from '../schemas/ReportsSchema';
import Stores from '../schemas/StoresSchema';

//
class AdminController {
    static AdminLogin = async (req, res, next) => {
        try {
            const {email, password} = req.body;
            const JWT_SECRET = process.env.JWT_SECRET;
            const adm_login = process.env.ADMIN_LOGIN;
            const adm_password = process.env.ADMIN_PASSWORD;
            if (email === adm_login || password === adm_password) {
                const token = jwt.sign({
                    isAdmin: true,
                    email: adm_login,
                    password: adm_password
                }, JWT_SECRET)
                res.status(200).json({
                    token
                })
            } else {
                res.status(400).json({
                    error: 'Неправильный пароль и/или логин.'
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetPendingSellers = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const sellerToApprove = await Sellers.find();
            res.status(200).json({
                sellerToApprove
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    static ApproveSellers = async (req, res, next) => {
        try {
            const {seller_user_id} = req.body;
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const updatedSeller = await Sellers.findByIdAndUpdate({
                _id: seller_user_id
            }, {
                status: 'approved'
            })
            res.status(200).json({
                message: 'success',
                details: 'Запрос продавца был успешно подтвержден.'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static DenySellers = async (req, res, next) => {
        try {
            const {seller_user_id, message_from_admin} = req.body;
            if (!message_from_admin) {
                res.status(400).json({
                    error: 'Сообщение для продавца не может быть пустым.'
                })
            }
            //
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            //
            const updatedSeller = await Sellers.findByIdAndUpdate({
                _id: seller_user_id,
            }, {
                status: 'denied',
                message_from_admin: message_from_admin
            });
            res.status(200).json({
                message: 'Запрос продавца был успешно опровергнут.'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetReports = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            //
            const reports = await Reports.find({
                status: 'pending'
            })
            if (reports.length === 0) {
                res.status(200).json({
                    message: 'Список жалоб на данный момент пуст.'
                });
            }
            if (reports !== 0) {
                console.log(reports.length)
                res.status(200).json({
                    message: 'success',
                    details: reports
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static ClaimSellers = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const sellers = [];
            const deniedSellers = await Sellers.find({
                status: 'denied'
            });
            const pendingSellers = await Sellers.find({
                status: 'pending'
            });
            sellers.push(...deniedSellers, ...pendingSellers);
            res.status(200).json(sellers)
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static ChangeStatus = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const {type, seller_id} = req.query;
            const {message} = req.body;
            if (type === 'approve') {
                await Sellers.findOneAndUpdate({
                    _id: seller_id
                }, {
                    status: 'approved',
                    message_from_admin: null
                })
                res.status(200).json({
                    message: 'success'
                })
            }
            if (type === 'deny') {
                await Sellers.findOneAndUpdate({
                    _id: seller_id
                }, {
                    status: 'denied',
                    message_from_admin: message
                });
                res.status(200).json({
                    message: 'success'
                })
            } else {
                res.status(300).json({
                    error: 'Непридведнная ошибка'
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetSellers = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const {seller_id} = req.query;
            const sellers = await Sellers.find({
                status: 'approved'
            });
            if (seller_id) {
                const shopsCount = await Stores.countDocuments({
                    seller_user_id: seller_id
                });
                const seller = await Sellers.findOne({
                    _id: seller_id
                })
                res.status(200).json({
                    sellerData: seller,
                    shopsCount: shopsCount
                })
            }
            res.status(200).json(sellers)
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static BanSellers = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const {seller_id, ban} = req.query;
            if (seller_id && ban) {
                await Sellers.findOneAndUpdate({
                    _id: seller_id
                }, {
                    is_banned: ban
                })
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

export default AdminController;
