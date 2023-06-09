import Promocodes from '../schemas/PromocodesSchema';

class PromocodesController {
    static GetPromocodes = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const promocodes = await Promocodes.find();
            res.status(200).json({
                promocodes
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static CreatePromocode = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const {text, percentage, user_id, use_count, valid_from, valid_until} = req.body;
            const promocode = await Promocodes.findOne({
                text: text
            });
            if (promocode.user_id !== -1) {
                res.status(400).json({
                    error: 'promocode_already_exists',
                    message: 'Промокод уже существует.'
                })
            }
            const newPromocode = new Promocodes({
                text: text,
                percentage: percentage,
                user_id: user_id,
                use_count: use_count,
                valid_from: valid_from,
                valid_until: valid_until
            })
            await newPromocode.save();

            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static UpdatePromocode = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const {id, text, percentage, use_count, valid_from, valid_until} = req.body;
            await Promocodes.findByIdAndUpdate({
                _id: id
            }, {
                $set: {
                    text: text,
                    percentage: percentage,
                    use_count: use_count,
                    valid_from: valid_from,
                    valid_until: valid_until
                }
            });
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static DeletePromocode = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const {id} = req.params;
            await Promocodes.findByIdAndDelete({
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
