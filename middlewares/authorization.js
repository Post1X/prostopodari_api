import jwt from 'jsonwebtoken';
import Sellers from '../schemas/SellersSchema';
import YooKassa from 'yookassa'
import Payments from '../schemas/PaymentsSchema';
import CheckPayment from '../utilities/checkpayment';

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
            const paymentId = await Payments.findOne({
                seller_id: userInfo.user_id,
                forSub: true
            })
            if (paymentId) {
                try {
                    const paymentStatus = await CheckPayment(paymentId.order_id);
                    if (paymentStatus.status === 'succeeded') {
                        const currentDate = new Date();
                        currentDate.setHours(0, 0, 0, 0);
                        const futureDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                        await Sellers.findOneAndUpdate({
                            _id: userInfo.user_id
                        }, {
                            subscription_status: true,
                            subscription_count: 5,
                            subscription_until: futureDate
                        });
                        await Payments.updateMany({
                            seller_id: userInfo.user_id,
                            forSub: true
                        }, {
                            forSub: false
                        })
                    }
                } catch (e) {
                    next(e);
                }
            }
            req.isSeller = userInfo.isSeller
            const seller = await Sellers.findOne({
                _id: userInfo.user_id
            });
            if (seller.subscription_until) {
                const subscriptionUntilDate = new Date(seller.subscription_until);
                if (new Date() >= subscriptionUntilDate) {
                    await Sellers.findOneAndUpdate({
                        _id: userInfo.user_id
                    }, {
                        subscription_until: null,
                        subscription_count: 0,
                        subscription_status: false
                    });
                    console.log('status changed');
                } else {
                    console.log('status not changed');
                }
            } else {
                console.log('subscription_until is null or undefined');
            }
        }
        next();
    } catch (e) {
        e.status = 401;
        next(e);
    }
}

export default authorization;

