import Sellers from '../schemas/SellersSchema';
import Goods from '../schemas/GoodsSchema';
import Payments from '../schemas/PaymentsSchema';
import CheckPayment from '../utilities/checkpayment';
import TempOrders from '../schemas/TempOrders';
import Orders from '../schemas/OrdersSchema';
import Cart from '../schemas/CartsSchema';
import CartItem from '../schemas/CartItemsSchema';
import Stores from '../schemas/StoresSchema';

class PromotionsController {
    static checkPromotion = async (req, res, next) => {
        try {
            const {store_id} = req.query;
            const seller = await Stores.findOne({
                _id: store_id
            });
            if (seller.subscription_status) {
                res.status(200).json(true)
            }
            if (!seller.subscription_status) {
                res.status(200).json(false)
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getPromotion = async (req, res, next) => {
        try {
            const {value, store_id} = req.body;
            const {user_id} = req;
            const organisation = await Stores.findOne({
                _id: store_id
            })
            const url = 'https://api.yookassa.ru/v3/payments';
            const subDetails = {
                month_amount: 250
            }
            if (!!organisation.subscription_status === true) {
                res.status(301).json({
                    error: 'У вас уже есть подписка'
                })
            }
            if (!!organisation.subscription_status === false) {
                function generateRandomString(length) {
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    let randomString = '';
                    for (let i = 0; i < length; i++) {
                        const randomIndex = Math.floor(Math.random() * characters.length);
                        randomString += characters.charAt(randomIndex);
                    }
                    return randomString;
                }

                const authHeader = 'Basic ' + Buffer.from('244369:test_7NnPZ1y9-SJDn_kaPGbXe1He3EmNJP-RyUvKD_47y7w').toString('base64');
                const idempotenceKey = generateRandomString(7);
                const requestData = {
                    amount: {
                        value: value ? value : subDetails.month_amount,
                        currency: 'RUB'
                    },
                    description: user_id,
                    confirmation: {
                        type: 'redirect',
                        return_url: 'http://localhost:3001/orders/sas'
                    },
                    save_payment_method: true
                };
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': authHeader,
                        'Idempotence-Key': idempotenceKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                })
                    .then(response => response.json())
                    .then(async data => {
                        try {
                            if (!data.error) {
                                await Payments.updateMany({
                                    seller_id: user_id
                                }, {
                                    isNew: false
                                })
                                const newPaymentMethod = new Payments({
                                    seller_id: user_id,
                                    order_id: data.id,
                                    isNew: true
                                })
                                await newPaymentMethod.save();
                                res.status(200).json({
                                    data: data.confirmation.confirmation_url
                                })
                            } else {
                                res.status(400).json({
                                    message: 'Ошибка. Попробуйте снова.'
                                })
                            }
                        } catch (error) {
                            console.error('Error saving payment:', error);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static setPromotion = async (req, res, next) => {
        try {
            const {good_id} = req.query;
            const good= await Goods.findOne({
                _id: good_id
            });
            const store = await Stores.findOne({
                _id: good.store_id
            });
            if (store.subscription_status !== true)
                return res.status(400).json({
                    message: 'Подписка неактивна.'
                })
            const seller = await Stores.findOne({
                _id: good.store_id
            })
            if (seller.subscription_count <= 0)
                return res.status(400).json({
                    message: 'Не осталось доступных продвижений.'
                })
            if (good.is_promoted === true)
                return res.status(400).json({
                    message: 'Товар уже продвигается.'
                })
            await Goods.findOneAndUpdate({
                _id: good_id
            }, {
                is_promoted: true
            });
            await Stores.findOneAndUpdate({
                _id: good.store_id
            }, {
                subscription_count: seller.subscription_count - 1
            });
            return res.status(200).json({
                message: 'success'
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static unsetPromotion = async (req, res, next) => {
        try {
            const {good_id} = req.query;
            const good= await Goods.findOne({
                _id: good_id
            });
            const seller = await Stores.findOne({
                _id: good.store_id
            })
            if (!!good.is_promoted === false)
                return res.status(400).json({
                    message: 'Непредвиденная ошибка.'
                })
            await Goods.findOneAndUpdate({
                _id: good_id
            }, {
                is_promoted: false
            });
            await Stores.findOneAndUpdate({
                _id: good.store_id
            }, {
                subscription_count: seller.subscription_count + 1
            });
            return res.status(200).json({
                message: 'success'
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getPromotionInfo = async (req, res, next) => {
        try {
            res.status(200).json({
                amount: 250
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static  changeSellerStatus = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {store_id} = req.body;
            const payment = await Payments.findOne({
                seller_id: user_id,
                isNew: true
            });
            const data = await CheckPayment(payment.order_id);
            if (data.paid === false) {
               return res.status(406).json({
                    message: 'Оплата не прошла. Попробуйте снова.'
                })
            } else {
                if (payment) {
                    await Payments.updateMany({
                        seller_id: user_id,
                        isNew: false
                    })
                    const currentDate = new Date();
                    const futureDate = new Date(currentDate);
                    futureDate.setMonth(currentDate.getDay() + 7);
                    const isoFormat = futureDate.toISOString();
                    await Stores.findOneAndUpdate({
                        _id: store_id
                    }, {
                        subscription_status: true,
                        subscription_until: isoFormat,
                        is_active: true,
                        subscription_count: 10
                    });
                    res.status(200).json({
                        message: 'success'
                    })
                }
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}


export default PromotionsController;
