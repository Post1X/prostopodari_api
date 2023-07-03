import Orders from '../schemas/OrdersSchema';
import OrdStatuses from '../schemas/OrdStatutesSchema';
import Goods from '../schemas/GoodsSchema';
import mongoose from 'mongoose';

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
                const numericPrice = parseFloat(number);
                return numericPrice;
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
}

export default OrdersController;
