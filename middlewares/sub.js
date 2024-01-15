import Payments from '../schemas/PaymentsSchema';
import Goods from '../schemas/GoodsSchema';
import Stores from '../schemas/StoresSchema';

const sub = async (req, res, next) => {
    try {
        const {user_id} = req;
        const payment = await Payments.findOne({
            seller_id: user_id,
            isNew: true,
        });

        if (payment) {
            const storesToUpdate = await Stores.find({
                _id: user_id,
                subscription_until: {
                    $lte: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
                },
            });

            if (storesToUpdate.length > 0) {
                await Promise.all(storesToUpdate.map(async (store) => {
                    await Stores.updateMany(
                        {
                            _id: store._id,
                        },
                        {
                            $set: {
                                subscription_status: false,
                                subscription_until: null,
                                subscription_count: 0,
                            },
                        }
                    );
                    await Goods.updateMany(
                        {
                            seller_user_id: user_id,
                            store_id: store._id,
                        },
                        {
                            is_promoted: false,
                        }
                    );
                }));

                console.log('Updated subscriptions for expired stores.');
            } else {
                console.log('No stores with expired subscriptions found.');
            }
        } else {
            console.log('Payment not found. Moving to the next middleware.');
        }
        next();
    } catch (e) {
        console.error('Error in subscription middleware:', e);
        e.status = 401;
        next(e);
    }
};

export default sub;
