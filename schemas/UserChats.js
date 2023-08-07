import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserChatsSchema = new Schema({
    name: {
        type: Schema.Types.String
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Buyers'
    },
    seller_id: {
        type: Schema.Types.ObjectId,
        ref: 'Sellers'
    },
    chatID: {
        type: Schema.Types.String
    },
    phone_number: {
        type: Schema.Types.String
    },
    newMessCount: {
        type: Schema.Types.Number
    },
    lastMessage: {
        type: Schema.Types.String
    },
    priority: {
        type: Schema.Types.String
    }
});

UserChatsSchema.pre('save', function (next) {
    const currentDate = new Date();
    this.date = currentDate.toISOString().split('T')[0];
    this.time = currentDate.toISOString().split('T')[1].split('.')[0];
    next();
});

const UserChats = mongoose.model('UserChats', UserChatsSchema);
export default UserChats;
