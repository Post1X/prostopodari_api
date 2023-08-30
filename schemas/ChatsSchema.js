import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ChatsSchema = new Schema({
    name: {
        type: Schema.Types.String
    },
    user_id: {
        type: Schema.Types.ObjectId,
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
    },
    date: {
        type: Schema.Types.Date
    },
    time: {
        type: Schema.Types.String
    }
});

ChatsSchema.pre('save', function (next) {
    const currentDate = new Date();
    this.date = currentDate.toISOString().split('T')[0];
    this.time = currentDate.toISOString().split('T')[1].split('.')[0];
    next();
});

const Chats = mongoose.model('Chat', ChatsSchema);
export default Chats;
