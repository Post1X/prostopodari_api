import Orders from '../schemas/OrdersSchema';
import OrdStatuses from '../schemas/OrdStatutesSchema';
import Goods from '../schemas/GoodsSchema';
import mongoose from 'mongoose';
import Stores from '../schemas/StoresSchema';

class OrdersController {
    static CreateOrder = async (req, res, next) => {
        try {
            const {
                goods_ids,
                store_id,
                day,
                time,
                phone_number,
                full_amount,
                city_id,
                address,
                name,
                payment_type,
                promocode,
                comment
            } = req.body;
            console.log(goods_ids)
            const {user_id} = req;
            const full_price = await Promise.all(goods_ids.map(async (price) => {
                const goods = await Goods.find({
                    _id: price
                });
                const number = goods[0].price.toString();
                return parseFloat(number);
            }));
            const status = '64a300a909a0356fcd6181bc';
            const objId = mongoose.Types.ObjectId(status)
            console.log(objId)
            const total = full_price.reduce((acc, cur) => acc + cur, 0);
            const newOrders = new Orders({
                goods_ids: goods_ids,
                store_id: store_id,
                user_id: user_id,
                city_id: city_id,
                address: address,
                name: name,
                delivery_day: day,
                delivery_time: time,
                phone_number: phone_number,
                full_amount: total,
                payment_type: payment_type,
                // comission_percentage:
                // income:
                status_id: objId,
                promocode: promocode,
                comment: comment
            });
            await newOrders.save();
            res.status(200).json({
                message: 'Ok'
            });
            await newOrders.save();
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    static GetOrdersUser = async (req, res, next) => {
        try {
            const {user_id} = req;
            const orders = await Orders.find({user_id: user_id})
                .populate({
                    path: 'store_id',
                })
                .populate({
                    path: 'goods_ids',
                })
                .populate({
                    path: 'user_id',
                })
                .populate({
                    path: 'status_id',
                })
                .exec();
            const modifiedOrders = orders.map((order) => {
                const modifiedTotalPrice = parseFloat(order.full_amount.toString())
                const modifiedGoodsIds = order.goods_ids.map((good) => {
                    const price = parseFloat(good.price.toString());
                    return {...good._doc, price: price};
                });
                return {...order._doc, goods_ids: modifiedGoodsIds, full_amount: modifiedTotalPrice};
            })
            res.status(200).json(modifiedOrders);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    };
    //
    static GetOrderSeller = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const {user_id} = req;
            console.log(user_id)
            const orders = await Orders.find();
            const filterOrders = [];
            for (const el of orders) {
                const id = el.store_id;
                const stores = await Stores.find({
                    _id: id,
                    seller_user_id: user_id
                }).select('_id');
                // console.log(stores, 'storesid')
                const orders = await Orders.find({
                    store_id: stores
                }).populate('goods_ids')
                    .populate('status_id')
                filterOrders.push(orders)
            }
            const modifiedOrders = filterOrders[0].map((order) => {
                const modifiedTotalPrice = parseFloat(order.full_amount.toString())
                const modifiedGoodsIds = order.goods_ids.map((good) => {
                    const price = parseFloat(good.price.toString());
                    return {...good._doc, price: price};
                });
                return {...order._doc, goods_ids: modifiedGoodsIds, full_amount: modifiedTotalPrice};
            })
            res.status(200).json(modifiedOrders)
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    static GetStatus = async (req, res, next) => {
        try {
            const status = await OrdStatuses.find();
            res.status(200).json(
                status
            )
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static ChangeStatus = async (req, res, next) => {
        try {
            const {order_id} = req.query;
            const {status_id} = req.body;
            const order = await Orders.findByIdAndUpdate({
                _id: order_id
            }, {
                status_id: status_id
            })
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default OrdersController;
