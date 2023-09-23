import Sellers from '../schemas/SellersSchema';
import Goods from '../schemas/GoodsSchema';
import Payments from '../schemas/PaymentsSchema';

class PromotionsController {
    static checkPromotion = async (req, res, next) => {
        try {
            const {user_id} = req;
            const seller = await Sellers.findOne({
                _id: user_id
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
            const {user_id} = req;
            const url = 'https://api.yookassa.ru/v3/payments';

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
                    value: 250,
                    currency: 'RUB'
                },
                capture: true,
                confirmation: {
                    type: 'redirect',
                    return_url: 'http://localhost:3001/orders/'
                },
                description: `Пользователь: ${user_id}`
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
                    const newPayment = new Payments({
                        seller_id: user_id,
                        order_id: data.id,
                        forSub: true
                    });
                    try {
                        await newPayment.save();
                        const filter = {_id: newPayment.id};
                        await Payments.updateMany({_id: {$ne: filter}}, {
                            forSub: false
                        });
                        console.log(newPayment._id);
                        res.status(200).json({
                            data: data.confirmation.confirmation_url,
                        });
                    } catch (error) {
                        console.error('Error saving payment:', error);
                        res.status(500).json({error: 'Failed to save payment data'});
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static setPromotion = async (req, res, next) => {
        try {
            const {good_id} = req.query;
            const {user_id} = req;
            const seller = await Sellers.findOne({
                _id: user_id
            })
            await Goods.findOneAndUpdate({
                _id: good_id
            }, {
                is_promoted: true
            });
            await Sellers.findOneAndUpdate({
                _id: user_id
            }, {
                subscription_count: seller.subscription_count - 1
            });
            res.status(200).json({
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
            const {user_id} = req;
            const seller = await Sellers.findOne({
                _id: user_id
            })
            await Goods.findOneAndUpdate({
                _id: good_id
            }, {
                is_promoted: false
            });
            await Sellers.findOneAndUpdate({
                _id: user_id
            }, {
                subscription_count: seller.subscription_count + 1
            });
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}


export default PromotionsController;
