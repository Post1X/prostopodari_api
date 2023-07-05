import Orders from '../schemas/OrdersSchema';
import Stores from '../schemas/StoresSchema';

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
                const order = await Orders.findOne({store_id: store._id});
                if (order) {
                    finances.push(order);
                }
            }
            const modifiedFinances = finances.map((item) => {
                const number = item.full_amount.toString();
                const numericPrice = parseFloat(number);
                return { ...item._doc, full_amount: numericPrice };
            });
            res.status(200).json(modifiedFinances);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default FinancesController;
