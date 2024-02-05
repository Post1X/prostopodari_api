import Orders from '../schemas/OrdersSchema';
import OrdStatuses from '../schemas/OrdStatutesSchema';
import mongoose from 'mongoose';
import Cart from '../schemas/CartsSchema';
import Stores from '../schemas/StoresSchema';
import CartItem from '../schemas/CartItemsSchema';
import Promocodes from '../schemas/PromocodesSchema';
import TempOrders from '../schemas/TempOrders';
import Payments from '../schemas/PaymentsSchema';
import CheckPayment from '../utilities/checkpayment';
import Goods from '../schemas/GoodsSchema';

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
                comment,
                delivery,
                addressAll
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
                        good_id: {...good.items[0].good_id.toObject(), price: (numericPrice * good.items[0].count)}
                    }]
                };
            });
            let goodArr = [];
            const storeId = goods[0].items[0].store_id
            const storeComission = await Stores.findOne({
                _id: storeId
            })
            await Promise.all(goods.map(async (item) => {
                goodArr.push(await Goods.findOne({_id: item.items[0].good_id}));
            }))
            const delivery_price = storeComission.distance;
            console.log(delivery, 'delivery');
            const deliveryPrice = Math.round(delivery_price * Math.round(delivery));
            const titleString = titleArr.join(' / ');
            console.log(titleString)
            const countArr = modifiedGoods.map((good) => {
                return {
                    title: good.items[0].good_id.title,
                    photo_list: good.items[0].good_id.photo_list,
                    price: good.items[0].good_id.price,
                    count: good.items[0].count,
                    _id: good.items[0].good_id._id,
                    day: day,
                    time: time,
                    address: address,
                    addressAll: addressAll,
                    city: city,
                    delivery_price: delivery_price,
                    name: name
                }
            });
            const countObj = countArr.reduce((obj, count, index) => {
                obj[`item${index + 1}`] = count;
                return obj;
            }, {});
            const goodsIds = modifiedGoods.map((good) => good.items[0].good_id._id);
            let totalPrice = modifiedGoods.reduce((accumulator, good) => {
                const price = good.items[0].good_id.price;
                return accumulator + price;
            }, 0);
            const weekdays = storeComission.weekdays;
            const weekends = storeComission.weekends;
            let promocodeCommission;
            let income;
            let incomeWithoutPromocode;
            let totalIncomeWithComission;
            const originalIncome = (totalPrice + deliveryPrice) * 30 / 100;
            let promocodeGet;
            if (promocode) {
                const userPromo = await Promocodes.findOne({
                    text: promocode,
                    user_id: user_id
                });
                const adminPromo = await Promocodes.findOne({
                    text: promocode,
                    priority: 'admin'
                });
                promocodeGet = userPromo ? userPromo : adminPromo
                promocodeCommission = promocodeGet.percentage / 100;
                const parts = promocodeGet.date.split('/');
                const isoDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                const futureDate = new Date(isoDate);
                futureDate.setMonth(isoDate.getMonth() + 12);
                const commissionIncomeDifference = (totalPrice + deliveryPrice) * promocodeCommission / 10;
                console.log(commissionIncomeDifference, 'разница в комиссии');
                totalIncomeWithComission = totalPrice - commissionIncomeDifference;
                console.log(totalIncomeWithComission, 'общий доход с комиссией');
                income = totalIncomeWithComission - (totalIncomeWithComission * 30) / 100;
                console.log(income, 'доход');
                if (promocodeGet.priority === 'user') {
                    await Promocodes.findOneAndUpdate(
                        {
                            _id: promocodeGet._id
                        },
                        {
                            was_used: true,
                            next_usage: futureDate
                        }
                    );
                }
            } else {
                const totalAmount = totalPrice + deliveryPrice;
                const commission = 0.3;
                incomeWithoutPromocode = totalAmount - (totalAmount * commission);
            }
            const status = '64a5e7e78d8485a11d0649ee';
            const card = '1234 5678 9123 1412';
            const objId = mongoose.Types.ObjectId(status)
            const timeParts = req.body.time.split(':');
            if (timeParts[1].length === 1) {
                timeParts[1] = '0' + timeParts[1];
            }
            const dateParts = req.body.day.split('-');
            const parsedDay = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            parsedDay.setUTCHours(timeParts[0]);
            parsedDay.setUTCMinutes(timeParts[1]);
            const dayOfWeek = parsedDay.getUTCDay();
            let isOpen = false;

            console.log('Debugging info:');
            console.log('timeParts:', timeParts);
            console.log('parsedDay:', parsedDay);

            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                console.log('Weekdays');
                const {from, to} = weekdays;
                console.log('from:', from, 'to:', to);

                const fromTime = new Date(parsedDay);
                fromTime.setUTCHours(parseInt(from.split(':')[0], 10));
                fromTime.setUTCMinutes(parseInt(from.split(':')[1], 10));

                const toTime = new Date(parsedDay);
                toTime.setUTCHours(parseInt(to.split(':')[0], 10));
                toTime.setUTCMinutes(parseInt(to.split(':')[1], 10));

                console.log('fromTime:', fromTime);
                console.log('toTime:', toTime);

                isOpen = parsedDay >= fromTime && parsedDay <= toTime;
            } else if (!weekends.not_working || dayOfWeek === 0 || dayOfWeek === 6) {
                console.log('Weekends');
                const {from, to} = weekends;
                console.log('from:', from, 'to:', to);
                const fromTime = new Date(parsedDay);
                fromTime.setUTCHours(parseInt(from.split(':')[0], 10));
                fromTime.setUTCMinutes(parseInt(from.split(':')[1], 10));

                const toTime = new Date(parsedDay);
                toTime.setUTCHours(parseInt(to.split(':')[0], 10));
                toTime.setUTCMinutes(parseInt(to.split(':')[1], 10));

                console.log('fromTime:', fromTime);
                console.log('toTime:', toTime);
                isOpen = parsedDay >= fromTime && parsedDay <= toTime;
            }
            // if (!isOpen) {
            //     return res.status(400).json({message: 'В это время магазин не работает'});
            // }
            const newOrders = new TempOrders({
                title: titleString,
                goods_ids: goodsIds,
                user_id: user_id,
                store_id: storeId,
                delivery_address: address,
                delivery_city: city,
                name: name,
                delivery_date: day,
                delivery_price: deliveryPrice,
                delivery_time: time,
                phone_number: phone_number,
                full_amount: (totalIncomeWithComission ? totalIncomeWithComission : totalPrice) + deliveryPrice,
                postcard: postcard,
                income: promocode ? income : incomeWithoutPromocode,
                status_id: objId,
                commission_percentage: 30,
                count: countArr,
                promocode: promocode,
                comment: comment,
                paid: false,
                paymentCard: card,
                promocodeComission: promocodeCommission,
                goods: goodArr,
                creationDate: new Date(),
                addressAll: addressAll
            });
            await TempOrders.updateMany({
                isNew: false
            })
            await newOrders.save();
            res.status(200).json({
                message: 'success'
            });
            await newOrders.save();
        } catch (e) {
            console.error('Ошибка при обработке заказа:', e.stack);
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
    //
    static confirmOrder = async (req, res, next) => {
        try {
            const {user_id} = req;
            const order = await Payments.findOne({
                seller_id: user_id,
                isNew: true,
                isTempOrder: true
            });
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
                    goods: tempOrderObj.goods,
                    creationDate: tempOrderObj.creationDate,
                    addressAll: tempOrderObj.adressAll
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
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default OrdersController;
