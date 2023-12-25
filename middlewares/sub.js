import Payments from "../schemas/PaymentsSchema";
import Goods from '../schemas/GoodsSchema';
import Stores from '../schemas/StoresSchema';

const sub = async (req, res, next) => {
    try {
        const { user_id } = req;
        const payment = await Payments.findOne({
            seller_id: user_id,
            isNew: true,
        });
        if (payment) {
            const organisation = await Stores.findOne({
                _id: user_id
            });
            if (organisation) {
                const orgdate = organisation.subscription_until;
                const currentDate = new Date();
                if (currentDate.toISOString() !== orgdate) {
                    console.log('Subscription is active. Moving to the next middleware.');
                    next();
                } else {
                    await Stores.updateOne({
                        _id: user_id
                    }, {
                        subscription_status: false,
                        subscription_until: null,
                        subscription_count: 0
                    })
                    await Goods.updateMany({
                        seller_user_id: user_id
                    }, {
                        is_promoted: false
                    })
                    next();
                }
            } else {
                console.log('Organisation not found. Moving to the next middleware.');
                next();
            }
        } else {
            console.log('Payment not found. Moving to the next middleware.');
            next();
        }
    } catch (e) {
        console.error('Error in subscription middleware:', e);
        e.status = 401;
        next(e);
    }
};

export default sub;
