import jwt from 'jsonwebtoken';
import Sellers from '../schemas/SellersSchema';
import YooKassa from 'yookassa'
import Payments from '../schemas/PaymentsSchema';
import CheckPayment from '../utilities/checkpayment';
import TempOrders from '../schemas/TempOrders';
import Orders from '../schemas/OrdersSchema';
import Cart from '../schemas/CartsSchema';
import CartItem from '../schemas/CartItemsSchema';

const yk = new YooKassa({
    shopId: '244372',
    secretKey: 'test_Uz5NU7QF7MxWtV5fAgjEWwF7jf1lSHhN1_k4bCyW4BU'
})
//
const EXCLUDE = ['/register/buyer', '/login/buyer', '/register/seller', '/login/seller', '/login/admin', '/register/buyer/call', '/register/buyer/confirm-number', '/sas']

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
        }
        next();
    } catch (e) {
        e.status = 401;
        next(e);
    }
}

export default authorization;

