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
        if (userInfo.phone_number) {
            console.log('321321312')
            const order = await Payments.findOne({
                seller_id: userInfo.user_id,
                isNew: true,
                isTempOrder: true
            });
            if (order) {
                const paymentStatus = await CheckPayment(order.order_id);
                let tempOrderObj;
                if (paymentStatus.status === 'succeeded') {
                    tempOrderObj = await TempOrders.findOne({
                        isNew: true
                    });
                    const newOrder = new Orders({
                        _id: tempOrderObj._id,
                        title: tempOrderObj.title,
                        store_id: tempOrderObj.store_id,
                        user_id: tempOrderObj.user_id,
                        delivery_date: tempOrderObj.delivery_date,
                        delivery_time: tempOrderObj.delivery_time,
                        delivery_address: tempOrderObj.delivery_address,
                        delivery_city: tempOrderObj.delivery_city,
                        delivery_info: tempOrderObj.delivery_info,
                        delivery_price: tempOrderObj.delivery_price,
                        full_amount: tempOrderObj.full_amount,
                        payment_type: tempOrderObj.payment_type,
                        commission_percentage: tempOrderObj.commission_percentage,
                        income: tempOrderObj.income,
                        status_id: '64a5e7fd8d8485a11d0649f2',
                        promocode: tempOrderObj.promocode,
                        postcard: tempOrderObj.postcard,
                        comment: tempOrderObj.comment,
                        paid: true,
                        paymentCard: tempOrderObj.paymentCard,
                        promocodeComission: tempOrderObj.promocodeComission,
                        comission: tempOrderObj.comission,
                        phone_number: tempOrderObj.phone_number,
                        name: tempOrderObj.name,
                        count: tempOrderObj.count,
                    });
                    await newOrder.save();
                    await Payments.deleteOne({
                        _id: order._id
                    });
                    await TempOrders.deleteOne({
                        _id: tempOrderObj._id
                    })
                    await Cart.deleteMany({
                        user: user_id
                    });
                    await CartItem.deleteMany({
                        buyer_id: user_id
                    })
                }
            }
        }
        next();
    } catch (e) {
        e.status = 401;
        next(e);
    }
}

export default authorization;

