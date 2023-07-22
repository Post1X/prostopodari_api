import CartItem from '../schemas/CartItemsSchema';
import Cart from '../schemas/CartsSchema';
import mongoose from 'mongoose';
import Goods from '../schemas/GoodsSchema';

class CartsController {
    static CreateCartItem = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {good_id, count} = req.body;
            const good = await Goods.findOne({
                _id: good_id
            });
            if (count > good.count) {
                res.status(300).json({
                    error: 'Товар отсутствует на складе.'
                })
            } else {
                await Goods.findOneAndUpdate({
                    _id: good_id
                }, {
                    count: good.count - count
                })
            }
            const newCartItem = new CartItem({
                good_id: mongoose.Types.ObjectId(good_id),
                count: count,
                store_id: good.store_id
            });
            await newCartItem.save();
            const newCart = new Cart({
                items: [newCartItem],
                user: user_id
            });
            await newCart.save();
            res.status(200).json({message: 'success'});
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    static GetCartItems = async (req, res, next) => {
        try {
            const {user_id} = req;
            const goods = await Cart.find({user: user_id})
                .populate('user')
                .populate('items.good_id')
                .populate({path: 'items.store_id', populate: {path: 'city_id'}});
            const modifiedGoods = goods.map((good) => {
                const price = good.items[0].good_id.price;
                const numericPrice = parseFloat(price);
                return {
                    ...good.toObject(),
                    items: [{
                        ...good.items[0].toObject(),
                        good_id: {...good.items[0].good_id.toObject(), price: numericPrice}
                    }]
                };
            });
            const totalPrice = modifiedGoods.reduce((accumulator, good) => {
                const price = good.items[0].good_id.price;
                return accumulator + price;
            }, 0);
            console.log(totalPrice)
            res.status(200).json(modifiedGoods);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    };

}

export default CartsController;
