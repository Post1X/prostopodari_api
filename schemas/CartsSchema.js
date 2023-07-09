// cart.js
import mongoose from 'mongoose';
import CartItem from './CartItemsSchema';

const CartSchema = new mongoose.Schema({
    items: [CartItem.schema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Buyers',
        required: true
    },
});

const Cart = mongoose.model('Cart', CartSchema);

export default Cart;
