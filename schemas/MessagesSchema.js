import mongoose from 'mongoose';
import Chats from './ChatsSchema';
import Buyers from './BuyersSchema';
import Sellers from './SellersSchema';

const Schema = mongoose.Schema;

const MessagesSchema = new Schema({
    chat_id: {
        type: Schema.Types.ObjectId,
        ref: 'Chats'
    },
    sender_id: {
        type: Schema.Types.ObjectId,
        ref: 'Buyers'
    }
})