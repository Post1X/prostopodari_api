import Promocodes from '../schemas/PromocodesSchema';

//
class PromocodesController {
    static GetPromocodes = async (req, res, next) => {
        try {
            const {user_id} = req;
            if (user_id) {
                const promocodes = await Promocodes.find({
                    user_id: user_id
                });
                res.status(200).json({
                    promocodes
                })
            } else if (req.isAdmin || req.isAdmin === true) {
                const promocodes = await Promocodes.findOne({
                    priority: 'admin'
                });
                res.status(200).json({
                    message: promocodes
                })
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
                user_id: user_id,
                text: text
            });
            if (promocode) {
                res.status(400).json({
                    error: 'Промокод уже существует.'
                })
            }
            if (!promocode) {
                const newPromocode = new Promocodes({
                    text: text,
                    event_name: event_name,
                    percentage: 5,
                    user_id: user_id,
                    date: date,
                    priority: 'user'
                })
                await newPromocode.save();

                res.status(200).json(
                    newPromocode
                )
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
                    text: text,
                    event_name: event_name,
                    percentage: percentage,
                    priority: 'admin'
                })
                await newPromocode.save();
                res.status(200).json(
                    newPromocode
                )
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
                        text: text,
                        event_name: event_name,
                        percentage: percentage,
                        user_id: user_id,
                        priority: 'admin'
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
            await Promocodes.findOneAndDelete({
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
}

export default PromocodesController;
