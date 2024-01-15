import Messages from '../schemas/MessagesSchema';
import Orders from '../schemas/OrdersSchema';

class CountsController {
    static getMessagesSeller = async (req, res, next) => {
        try {
            const {user_id} = req;
            const messages = await Messages.findOne({
                seller_id: user_id
            });
            res.status(200).json({
                count: messages.newMessCount
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getMessagesBuyer = async (req, res, next) => {
        try {
            const {user_id} = req;
            const messages = await Messages.findOne({
                user_id: user_id
            });
            res.status(200).json({
                count: messages.newMessCount
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getOrdersCountBuyer = async (req, res, next) => {
        try {
            const {user_id} = req;
            const orders = await Orders.count({
                user_id: user_id
            });
            res.status(200).json({
                count: orders
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getOrdersCountSeller = async (req, res, next) => {
        try {
            const {user_id} = req;
            const orders = await Orders.find({});
            const ordersWithSellerIdInGoods = orders.filter(order => {
                return order.goods[0] && order.goods[0].seller_user_id.equals(user_id);
            });
            const count = ordersWithSellerIdInGoods.length;
            res.status(200).json({
                count: count
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default CountsController;
