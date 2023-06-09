import mongoose from 'mongoose';
import Orders from './OrdersSchema';
import Sellers from './SellersSchema';
import Buyers from './BuyersSchema';

const Schema = mongoose.Schema;

const ChatsSchema = new Schema({
    order_id: {
        type: Schema.Types.ObjectId,
        ref: 'Orders'
    },
    seller_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Sellers'
    },
    buyer_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Buyers'
    }
});

const Chats = mongoose.model('Chats', ChatsSchema)

export default Chats;