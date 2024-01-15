import Promocodes from '../schemas/PromocodesSchema';
import Fcm from '../schemas/FcmSchema';
import admin from 'firebase-admin';

//
class PromocodesController {
    static GetPromocodes = async (req, res, next) => {
        try {
            const {user_id} = req;
            const promo = [];
            if (user_id) {
                const promocodes = await Promocodes.find({
                    user_id: user_id
                });
                res.status(200).json({
                    promocodes
                })
            } else if (req.isAdmin || req.isAdmin === true) {
                const promocodes = await Promocodes.find({priority: 'admin'});
                promocodes.map((item) => {
                    console.log(item, 'item')
                    promo.push(item)
                })
                res.status(200).json(promo)
            } else {
                res.status(400).json({
                    error: 'Что-то пошло не так'
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static CreatePromocode = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {text, date, event_name} = req.body;
            const promocode = await Promocodes.findOne({
                user_id: user_id, text: text
            });
            if (promocode) {
                res.status(400).json({
                    error: 'Промокод уже существует.'
                })
            }
            if (!promocode) {
                const newPromocode = new Promocodes({
                    text: text, event_name: event_name, percentage: 5, user_id: user_id, date: date, priority: 'user'
                })
                await newPromocode.save();

                res.status(200).json(newPromocode)
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static CreatePromocodeAdmin = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                });
            }
            if (req.isAdmin || req.isAdmin === true) {
                const {text, event_name, percentage} = req.body;
                const promocode = await Promocodes.findOne({
                    text: text
                });
                if (promocode) {
                    res.status(400).json({
                        error: 'Промокод уже существует.'
                    })
                }
                const newPromocode = new Promocodes({
                    text: text, event_name: event_name, percentage: percentage, priority: 'admin'
                })
                await newPromocode.save();
                const users = await Fcm.find();
                let token_array = [];
                users.map((item) => {
                    if (item.is_driver === true)
                        token_array.push(item.token);
                });

                const message = {
                    notification: {
                        title: 'Промокод специально для тебя! 👀',
                        body: `У нас праздник "${event_name}", и мы решили подарить вам промокод ${text} на ${percentage}%!`
                    }, tokens: token_array
                };

                await admin.messaging()
                    .sendMulticast(message)
                    .catch((error) => {
                        throw error;
                    });
                res.status(200).json(newPromocode)
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static UpdatePromocode = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {promocode_id} = req.query;
            const {text, date, event_name, percentage} = req.body;
            if (user_id) {
                await Promocodes.findByIdAndUpdate({
                    _id: promocode_id
                }, {
                    $set: {
                        text: text,
                        event_name: event_name,
                        percentage: 5,
                        user_id: user_id,
                        date: date,
                        priority: 'user'
                    }
                });
                res.status(200).json({
                    message: 'success'
                })
            }
            if (req.isAdmin || req.isAdmin === true) {
                await Promocodes.findByIdAndUpdate({
                    _id: promocode_id
                }, {
                    $set: {
                        text: text, event_name: event_name, percentage: percentage, user_id: user_id, priority: 'admin'
                    }
                });
                res.status(200).json({
                    message: 'success'
                })
            } else {
                res.status(200).json({
                    error: 'Непредвиденная ошибка'
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static DeletePromocode = async (req, res, next) => {
        try {
            const {id} = req.query;
            await Promocodes.deleteOne({
                _id: id
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
    static checkPromocode = async (req, res, next) => {
        try {
            const {text} = req.body;
            console.log('anus')
            const {user_id} = req;
            let promo;
            const currentDate = new Date();
            const promocode = await Promocodes.findOne({
                text: text, user_id: user_id, was_used: false
            });
            if (promocode) {
                console.log('anus')
                const currentDate = new Date();
                const currentMonth = ('0' + (currentDate.getMonth() + 1)).slice(-2);
                const currentDay = ('0' + currentDate.getDate()).slice(-2);

                const promoDate = new Date(promocode.date);
                const promoDateMonth = ('0' + (promoDate.getMonth() + 1)).slice(-2);
                const promoDateDay = ('0' + promoDate.getDate()).slice(-2);

                const currentDateFormatted = `${currentDay}${currentMonth}`;
                const promoDateFormatted = `${promoDateDay}${promoDateMonth}`;
                if (!promocode.next_usage) {
                    res.status(200).json(true);
                } else {
                    const promoNextUsageDate = new Date(promocode.next_usage);
                    const promoNextUsageMonth = ('0' + (promoNextUsageDate.getMonth() + 1)).slice(-2);
                    const promoNextUsageDay = ('0' + promoNextUsageDate.getDate()).slice(-2);
                    const promoNextUsageFormatted = `${promoNextUsageDay}${promoNextUsageMonth}`;
                    if (currentDateFormatted === promoNextUsageFormatted && currentDateFormatted === promoDateFormatted) {
                        res.status(200).json(true);
                    } else {
                        res.status(200).json(false);
                    }
                }
            }
            if (!promocode) {
                promo = await Promocodes.findOne({
                    text: text, priority: 'admin'
                })
            }
            if (promo && promocode) {
                res.status(200).json(true);
            } else {
                res.status(200).json(false)
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default PromocodesController;
