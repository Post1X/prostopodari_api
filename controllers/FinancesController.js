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
            const { dateStart, dateEnd } = req.query;
            const startDate = moment(dateStart, 'YY-MM-DD').startOf('day').unix();
            const endDate = moment(dateEnd, 'YY-MM-DD').endOf('day').unix();
            const orders = await Orders.find({ createdAt: { $gte: startDate, $lte: endDate } })
                .populate('store_id')
                .populate('user_id')
                .populate({
                    path: 'store_id',
                    populate: {
                        path: 'seller_user_id',
                    },
                });

            const stores = [];
            const modifiedFinances = orders.map((item) => {
                try {
                    const numericPrice = parseFloat(item.full_amount) || 0;
                    console.log(item.full_amount, 'fullamount');
                    const comperc = parseFloat(item.comission_percentage) || 0;
                    const promocom = parseFloat(item.promocodeComission) || 0;
                    const numericIncome = parseFloat(item.income) || 0;
                    const timestamp = new Date(parseInt(item._id.toString().substring(0, 8), 16) * 1000);
                    const formattedTimestamp = moment(timestamp).format('YY-MM-DD');
                    return { ...item._doc, full_amount: numericPrice, income: numericIncome };
                } catch (error) {
                    console.error('Ошибка при обработке заказа:', error);
                    return null;
                }
            });

            const allAmount = modifiedFinances.reduce((total, item) => {
                return Math.ceil(total + (item ? parseFloat(item.full_amount) : 0));
            }, 0);

            const allIncome = modifiedFinances.reduce((total, item) => {
                return Math.ceil(total + (item ? parseFloat(item.income) : 0));
            }, 0);

            const payAmount = allAmount - allIncome;

            const statistics = {
                allAmount: allAmount,
                payAmount: payAmount,
                income: allIncome,
            };

            const modifiedFinancesData = orders.map((item) => {
                try {
                    const comperc = parseFloat(item.commission_percentage) || 0;
                    const promocom = parseFloat(item.promocodeComission) || 0;
                    const timestamp = new Date(parseInt(item._id.toString().substring(0, 8), 16) * 1000);
                    const formattedTimestamp = moment(timestamp).format('YY-MM-DD');

                    function generateRandom7DigitNumber() {
                        const min = 0;
                        const max = 9999999;
                        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
                        return randomNumber.toString().padStart(7, '0');
                    }

                    const store = {
                        _id: item.store_id ? item.store_id._id : null,
                        order_number: generateRandom7DigitNumber(),
                        ip: item.store_id ? item.store_id.seller_user_id.ip : null,
                        storeName: item.store_id ? item.store_id.title : null,
                        phone_number: item.store_id ? item.user_id.phone_number : null,
                        sellerName: item.store_id ? item.store_id.seller_user_id.name : null,
                    };

                    const finance = {
                        payAmount: Math.ceil(parseFloat(item.full_amount) || 0),
                        income: Math.ceil(parseFloat(item.income) || 0),
                        allAmount: Math.ceil(parseFloat(item.full_amount) || 0) + Math.ceil(parseFloat(item.income) || 0),
                        deliveryAmount: 0,
                        paymentCard: item.paymentCard || null,
                        sellerName: item.store_id ? item.store_id.seller_user_id.name : null,
                        comission: {
                            percent: comperc,
                            promo: promocom,
                        },
                    };

                    return { seller: store, finance: finance };
                } catch (error) {
                    console.error('Ошибка при обработке финансов данных:', error);
                    return null;
                }
            });

            res.status(200).json({
                statistics: statistics,
                financesSellers: modifiedFinancesData.filter((item) => item !== null),
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    };
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

                function getTimeFromObjectId(objectId) {
                    const hexString = objectId.toString();
                    const timestampHexString = hexString.substring(0, 8);
                    const timestampDecimal = parseInt(timestampHexString, 16);
                    const dateObject = new Date(timestampDecimal * 1000);
                    const hours = dateObject.getHours();
                    const minutes = dateObject.getMinutes();
                    return {hours, minutes};
                }

                const time = getTimeFromObjectId(item._id);

                function generateRandom7DigitNumber() {
                    const min = 0;
                    const max = 9999999;
                    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
                    return randomNumber.toString().padStart(7, '0');
                }

                const info = {
                    order_number: generateRandom7DigitNumber(),
                    orderID: item._id,
                    dateTime: formattedTimestamp,
                    time: time,
                    storeName: item.store_id.title,
                    phone_number: item.user_id.phone_number,
                    sellerName: item.store_id.seller_user_id.name
                };
                const finance = {
                    payAmount: Math.ceil(parseFloat(item.full_amount)),
                    income: Math.ceil(parseFloat(item.income)),
                    allAmount: Math.ceil(parseFloat(item.full_amount)) + Math.ceil(parseFloat(item.income)),
                    deliveryAmount: 0,
                    paymentCard: item.paymentCard,
                    sellerName: item.store_id.seller_user_id.name,
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
