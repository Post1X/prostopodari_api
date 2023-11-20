import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
    good_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Goods',
    },
    count: {
        type: Number,
    },
    store_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Stores'
    },
    buyer_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Buyers'
    },
    isGettingReady: {
        type: mongoose.Schema.Types.Boolean
    }
});

const CartItem = mongoose.model('CartItem', CartItemSchema);

export default CartItem;
