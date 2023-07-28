import Orders from '../schemas/OrdersSchema';
import Stores from '../schemas/StoresSchema';
import moment from 'moment';

class FinancesController {
    static GetFinances = async (req, res, next) => {
        try {
            const {user_id} = req;
            const stores = await Stores.find({seller_user_id: user_id});
            if (stores.length === 0) {
                return res.status(404).json({message: 'Магазины не найдены'});
            }
            const finances = [];
            for (const store of stores) {

                const order = await Orders.find({store_id: store._id})
                    .populate('user_id')
                    .populate('goods_ids')
                    .populate('status_id')
                    .populate('store_id')
                if (order) {
                    finances.push(...order);
                }
            }
            const modifiedFinances = finances.map((item) => {
                console.log(item, 'item')
                const number = item.full_amount.toString();
                const numericPrice = parseFloat(number);
                const income = item.income.toString();
                const numericIncome = parseFloat(income)
                return {...item._doc, full_amount: numericPrice, income: income};
            });
            res.status(200).json(modifiedFinances);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    static GetFinancesAdmin = async (req, res, next) => {
        try {
            // if (!req.isAdmin || req.isAdmin !== true) {
            //     res.status(400).json({
            //         error: 'У вас нет права находиться на данной странице.'
            //     });
            // }
            const {dateStart, dateEnd} = req.query;
            const startDate = moment(dateStart, 'YY-MM-DD').startOf('day').unix();
            const endDate = moment(dateEnd, 'YY-MM-DD').endOf('day').unix();
            const orders = await Orders.find({createdAt: {$gte: startDate, $lte: endDate}})
                .populate('store_id')
                .populate('user_id')
                .populate({
                    path: 'store_id',
                    populate: {
                        path: 'seller_user_id',
                    },
                })
            const stores = [];
            const modifiedFinances = orders.map((item) => {
                const numericPrice = parseFloat(item.full_amount);
                console.log(item.full_amount, 'fullamount')
                const comperc = parseFloat(item.comission_percentage);
                const promocom = parseFloat(item.promocodeComission)
                const numericIncome = parseFloat(item.income);
                const timestamp = new Date(parseInt(item._id.toString().substring(0, 8), 16) * 1000);
                const formattedTimestamp = moment(timestamp).format('YY-MM-DD');
                return {...item._doc, full_amount: numericPrice, income: numericIncome};
            });
            const allAmount = modifiedFinances.reduce((total, item) => {
                return Math.ceil(total + parseFloat(item.full_amount));
            }, 0);
            const allIncome = modifiedFinances.reduce((total, item) => {
                return Math.ceil(total + parseFloat(item.income));
            }, 0);
            const payAmount = allAmount - allIncome;


            const statistics = {
                allAmount: allAmount,
                payAmount: payAmount,
                income: allIncome
            };
            console.log(orders, 'orders')
            const modifiedFinancesData = orders.map((item) => {
                const comperc = parseFloat(item.commission_percentage);
                const promocom = parseFloat(item.promocodeComission)
                const timestamp = new Date(parseInt(item._id.toString().substring(0, 8), 16) * 1000);
                const formattedTimestamp = moment(timestamp).format('YY-MM-DD');
                const store = {
                    _id: item.store_id._id,
                    ip: item.store_id.seller_user_id.ip,
                    storeName: item.store_id.title,
                    phone_number: item.user_id.phone_number
                };
                const finance = {
                    payAmount: Math.ceil(parseFloat(item.full_amount)),
                    income: Math.ceil(parseFloat(item.income)),
                    allAmount: Math.ceil(parseFloat(item.full_amount)) + Math.ceil(parseFloat(item.income)),
                    deliveryAmount: 0,
                    paymentCard: item.paymentCard,
                    comission: {
                        percent: comperc,
                        promo: promocom
                    }
                }
                return {seller: store, finance: finance};
            });
            res.status(200).json({
                statistics: statistics,
                financesSellers: modifiedFinancesData
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    static GetFinanceForStore = async (req, res, next) => {
        try {
            // if (!req.isAdmin || req.isAdmin !== true) {
            //     res.status(400).json({
            //         error: 'У вас нет права находиться на данной странице.'
            //     });
            // }
            const {seller_id, dateStart, dateEnd} = req.query;
            const startDate = moment(dateStart, 'YY-MM-DD').startOf('day').unix();
            const endDate = moment(dateEnd, 'YY-MM-DD').endOf('day').unix();
            const seller_stores = [];
            const stores = await Stores.find({seller_user_id: seller_id});
            const ordersSeller = await Promise.all(
                stores.map((item) => {
                    return Orders.find({store_id: item, createdAt: {$gte: startDate, $lte: endDate}})
                        .populate('store_id')
                        .populate('user_id')
                })
            );
            const orders = ordersSeller.flatMap((order) => order);
            const modifiedFinancesData = orders.map((item) => {
                const comperc = parseFloat(item.commission_percentage);
                const promocom = parseFloat(item.promocodeComission)
                const timestamp = new Date(parseInt(item._id.toString().substring(0, 8), 16) * 1000);
                const formattedTimestamp = moment(timestamp).format('YY-MM-DD');
                console.log(item)
                const info = {
                    orderID: item._id,
                    dateTime: formattedTimestamp,
                    storeName: item.store_id.title,
                    phone_number: item.user_id.phone_number
                };
                const finance = {
                    payAmount: Math.ceil(parseFloat(item.full_amount)),
                    income: Math.ceil(parseFloat(item.income)),
                    allAmount: Math.ceil(parseFloat(item.full_amount)) + Math.ceil(parseFloat(item.income)),
                    deliveryAmount: 0,
                    paymentCard: item.paymentCard,
                    comission: {
                        percent: comperc,
                        promo: promocom
                    }
                }
                return {info: info, finance: finance};
            });
            const modifiedFinances = orders.map((item) => {
                const numericPrice = parseFloat(item.full_amount);
                console.log(item.full_amount, 'fullamount')
                // const comperc = parseFloat(item.comission_percentage);
                // const promocom = parseFloat(item.promocodeComission)
                const numericIncome = parseFloat(item.income);
                const timestamp = new Date(parseInt(item._id.toString().substring(0, 8), 16) * 1000);
                const formattedTimestamp = moment(timestamp).format('YY-MM-DD');
                return {...item._doc, full_amount: numericPrice, income: numericIncome};
            });
            const allAmount = modifiedFinances.reduce((total, item) => {
                return Math.ceil(total + parseFloat(item.full_amount));
            }, 0);
            const allIncome = modifiedFinances.reduce((total, item) => {
                return Math.ceil(total + parseFloat(item.income));
            }, 0);
            const payAmount = allAmount - allIncome;
            const statistics = {
                allAmount: allAmount,
                payAmount: payAmount,
                income: allIncome
            };
            res.status(200).json({
                statistics: statistics,
                orders: modifiedFinancesData
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default FinancesController;
