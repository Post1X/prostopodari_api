import Orders from '../schemas/OrdersSchema';
import OrdStatuses from '../schemas/OrdStatutesSchema';
import mongoose from 'mongoose';
import Cart from '../schemas/CartsSchema';
import Stores from '../schemas/StoresSchema';
import Promocodes from '../schemas/PromocodesSchema';
import CartItem from '../schemas/CartItemsSchema';

//
class OrdersController {
    static CreateOrder = async (req, res, next) => {
        try {
            const {
                day,
                time,
                phone_number,
                postcard,
                city,
                address,
                name,
                promocode,
                comment
            } = req.body;
            const {user_id} = req;
            const titleArr = [];
            const goods = await Cart.find({user: user_id})
                .populate('user')
                .populate('items.good_id')
                .populate({path: 'items.store_id'});
            const modifiedGoods = goods.map((good) => {
                const price = good.items[0].good_id.price;
                const numericPrice = parseFloat(price);
                const title = good.items[0].good_id.title;
                titleArr.push(title);
                return {
                    ...good.toObject(),
                    items: [{
                        ...good.items[0].toObject(),
                        good_id: {...good.items[0].good_id.toObject(), price: numericPrice}
                    }]
                };
            });
            const titleString = titleArr.join(' / ');
            console.log(titleString)
            const storeId = goods[0].items[0].store_id
            const countArr = modifiedGoods.map((good) => {
                return {
                    title: good.items[0].good_id.title,
                    count: good.items[0].count
                }
            })
            const countObj = countArr.reduce((obj, count, index) => {
                obj[`item${index + 1}`] = count;
                return obj;
            }, {});
            console.log(countObj)
            const goodsIds = modifiedGoods.map((good) => good.items[0].good_id._id);
            const storeComission = await Stores.findOne({
                _id: storeId
            })
            console.log(storeComission.comission)
            const totalPrice = modifiedGoods.reduce((accumulator, good) => {
                const price = good.items[0].good_id.price;
                return accumulator + price;
            }, 0);
            // const promocodeGet = await Promocodes.findOne({
            //     text: promocode
            // })
            const weekdays = storeComission.weekdays;
            const weekends = storeComission.weekends;
            const delivery_price = storeComission.distance;
            // const promocodeCommission = promocodeGet.percentage;
            // const income = (totalPrice * (promocodeCommission + 30)) / 100;
            const income = (totalPrice * 30) / 100;
            const status = '64a5e7e78d8485a11d0649ee';
            const card = '1234 5678 9123 1412';
            const objId = mongoose.Types.ObjectId(status)
            // const parsedTime = new Date(`${req.body.time} UTC`);
            // const parsedDay = new Date(req.body.day);
            // const dayOfWeek = parsedDay.getUTCDay();
            // let isOpen = false;
            // if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            //     const {from, to} = weekdays;
            //     const fromTime = new Date(`${parsedTime.toISOString().split('T')[0]}T${from}Z`);
            //     const toTime = new Date(`${parsedTime.toISOString().split('T')[0]}T${to}Z`);
            //     isOpen = parsedTime >= fromTime && parsedTime <= toTime;
            // } else if (dayOfWeek === 0 || dayOfWeek === 6) {
            //     const {from, to} = weekends;
            //     const fromTime = new Date(`${parsedTime.toISOString().split('T')[0]}T${from}Z`);
            //     const toTime = new Date(`${parsedTime.toISOString().split('T')[0]}T${to}Z`);
            //     isOpen = parsedTime >= fromTime && parsedTime <= toTime;
            // }
            // if (!isOpen) {
            //     return res.status(400).json({message: 'В это время магазин не работает'});
            // }
            const newOrders = new Orders({
                title: titleString,
                goods_ids: goodsIds,
                user_id: user_id,
                store_id: storeId,
                delivery_address: address,
                delivery_city: city,
                name: name,
                delivery_date: day,
                delivery_price: 0,
                delivery_time: time,
                phone_number: phone_number,
                full_amount: totalPrice,
                postcard: postcard,
                income: income,
                status_id: objId,
                commission_percentage: 30,
                count: countArr,
                // promocode: promocode,
                comment: comment,
                paid: false,
                paymentCard: card,
                // promocodeComission: promocodeCommission,
            });
            await newOrders.save();
            //
            // if (promocodeGet.priority === 'user') {
            //     await Promocodes.findOneAndDelete({
            //         text: promocode
            //     })
            // }
            //
            res.status(200).json({
                message: 'success'
            });
            await Cart.deleteMany({
                user: user_id
            });
            await CartItem.deleteMany({
                buyer_id: user_id
            })
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
    static GetOrderSeller = async (req, res, next) => {
        try {
            const {user_id} = req;
            const stores = await Stores.find({
                seller_user_id: user_id
            });
            const orders = await Orders.find()
                .populate('store_id')
                .populate('goods_ids')
                .populate('status_id')
            const aaa = [];
            orders.forEach(function (element) {
                if (
                    element.store_id &&
                    stores.some(store => store._id.toString() === element.store_id._id.toString())
                ) {
                    aaa.push(element);
                }
            });
            const modifiedOrders = aaa.map((order) => {
                const modifiedTotalPrice = parseFloat(order.full_amount.toString())
                const modifiedIncome = parseFloat(order.income.toString())
                const modifiedGoodsIds = order.goods_ids.map((good) => {
                    const price = parseFloat(good.price.toString());
                    return {...good._doc, price: price};
                });
                return {
                    ...order._doc,
                    goods_ids: modifiedGoodsIds,
                    full_amount: modifiedTotalPrice,
                    income: modifiedIncome
                };
            })
            res.status(200).json(modifiedOrders);
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
    //
    static CreateStatus = async (req, res, next) => {
        try {
            const {status} = req.body;
            const newOrdStatus = new OrdStatuses({
                name: status
            })
            await newOrdStatus.save();
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetOrder = async (req, res, next) => {
        try {
            const {order_id} = req.query;
            const order = await Orders.findOne({
                _id: order_id
            })
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
            res.status(200).json(order)
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default OrdersController;
