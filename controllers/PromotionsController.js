import Sellers from '../schemas/SellersSchema';
import Goods from '../schemas/GoodsSchema';

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
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            const futureDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            await Sellers.findOneAndUpdate({
                _id: user_id
            }, {
                subscription_status: true,
                subscription_count: 5,
                subscription_until: futureDate
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
