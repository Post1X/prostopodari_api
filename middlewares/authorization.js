import jwt from 'jsonwebtoken';
import Sellers from '../schemas/SellersSchema';
//
const EXCLUDE = ['/register/buyer', '/login/buyer', '/register/seller', '/login/seller', '/login/admin', '/register/buyer/call', '/register/buyer/confirm-number']

const authorization = async (req, res, next) => {
    try {
        const {authorization = ''} = req.headers;
        const {originalUrl, method} = req;
        console.log(req.path)
        if (method === 'OPTIONS' || EXCLUDE.includes(req.path)) {
            next();
            return;
        }
        if (!authorization) {
            res.status(400).json({
                error: 'no_token',
                description: 'Непредвиденная ошибка. Свяжитесь с администрацией.'
            })
        }
        const {JWT_SECRET} = process.env;
        const token = authorization.replace('Bearer ', '');
        const userInfo = jwt.verify(token, JWT_SECRET);
        req.user_id = userInfo.user_id;
        if (userInfo.isAdmin) {
            req.isAdmin = userInfo.isAdmin
        }
        if (userInfo.isSeller) {
            req.isSeller = userInfo.isSeller
            const seller = await Sellers.findOne({
                _id: userInfo.user_id
            });
            if (new Date() === seller.subscription_until ?  seller.subscription_until.toISOString() : false) {
                await Sellers.findOneAndUpdate({
                    _id: userInfo.user_id
                }, {
                    subscription_until: null,
                    subscription_count: 0,
                    subscription_status: false
                });
                console.log('status changed')
            }
            if (new Date().toUTCString() !== seller.subscription_until) {
                console.log('status not changed')
            }
        }
        next();
    } catch (e) {
        e.status = 401;
        next(e);
    }
}

export default authorization;

