import CartItem from '../schemas/CartItemsSchema';
import Cart from '../schemas/CartsSchema';
import mongoose from 'mongoose';
import Goods from '../schemas/GoodsSchema';

class CartsController {
    static CreateCartItem = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {good_id, count} = req.body;
            const good = await Goods.findOne({_id: good_id});
            if (!good) {
                return res.status(300).json({error: 'Товар не найден.'});
            }
            const cartItems = await CartItem.find({buyer_id: user_id});
            if (count > good.count && isGettingReady === false) {
                return res.status(300).json({error: 'Товар отсутствует на складе.'});
            }
            const cartItemWithDifferentStore = cartItems.find(item => item ? item.store_id.toString() !== good.store_id.toString() : true);
            if (cartItemWithDifferentStore) {
                return res.status(400).json({error: 'Товары могут быть только из одного магазина.'});
            }
            const cart = await Cart.findOne({
                goodId: good_id,
                user: user_id
            })
            if (!cart) {
                const newCartItem = new CartItem({
                    good_id: mongoose.Types.ObjectId(good_id),
                    count: count,
                    store_id: good.store_id,
                    buyer_id: user_id,
                    isGettingReady: !!good.isGettingReady
                });
                await newCartItem.save();
                const newCart = new Cart({
                    items: [newCartItem], user: user_id, goodId: good_id
                });
                await newCart.save();
                return res.status(200).json({message: 'success'});
            } else {
                await Cart.updateOne({
                    goodId: good_id,
                    user: user_id
                }, {
                    $inc: {'items.$[].count': count}
                });
                return res.status(200).json({
                    message: 'success'
                })
            }
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
                .populate({path: 'items.store_id'});
            console.log(goods)
            const modifiedGoods = goods.map((good) => {
                const price = good.items[0].good_id.price;
                const numericPrice = parseFloat(price);
                return {
                    ...good.toObject(), items: [{
                        ...good.items[0].toObject(), good_id: {...good.items[0].good_id.toObject(), price: numericPrice}
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
    }
    //
    static DeleteCartItem = async (req, res, next) => {
        try {
            const {count, good_id, deleteAll, cartId} = req.body;
            const {user_id} = req;
            const cartGood = await Cart.findOne({
                _id: cartId
            });
            const good = await Goods.findOne({
                _id: good_id
            });
            if (count >= cartGood.items[0].count) {
                await Cart.findOneAndUpdate(
                    {_id: cartId, 'items.good_id': good_id},
                    {
                        $set: {
                            'items.$[].count': 0
                        }
                    }
                );
                res.status(400).json({
                    error: 'Товаров больше не осталось'
                });
            } else if (count <= cartGood.items[0].count) {
                await Cart.findOneAndUpdate(
                    {_id: cartId, 'items.good_id': good_id},
                    {
                        $inc: {'items.$[].count': -count}
                    }
                );
                res.status(200).json({
                    message: 'success'
                });
            } else if (deleteAll) {
                await CartItem.deleteMany({
                    good_id: good_id,
                    buyer_id: user_id
                })
                await Cart.findOneAndDelete({
                    _id: cartId
                });
                res.status(200).json({
                    message: 'success'
                });
            }
        } catch (e) {
            e.status = 500;
            next(e);
        }
    }


    //
    static AddToCart = async (req, res, next) => {
        try {
            const {good_id, count, cartId} = req.body;
            const {user_id} = req;
            const cartGood = await Cart.findOne({
                _id: cartId
            })
            const good = await Goods.findOne({
                _id: good_id
            })
            if (cartGood.items[0].count + count > good.count) {
                res.status(300).json({error: 'Товар отсутствует на складе.'});
            } else {
                await Cart.findOneAndUpdate({
                    _id: cartId, buyer_id: user_id
                }, {
                    $inc: {'items$[].count': count}
                });
                res.status(200).json({
                    message: 'success'
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default CartsController;
