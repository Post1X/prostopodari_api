import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MessagesSchema = new Schema({
    room_id: {
        type: Schema.Types.String,
    },
    text: {
        type: Schema.Types.String,
    },
    date: {
        type: Schema.Types.Date
    },
    time: {
        type: Schema.Types.String
    },
    isRead: {
        type: Schema.Types.Boolean
    },
    role: {
        type: Schema.Types.String
    },
    name: {
        type: Schema.Types.String
    }
});

MessagesSchema.pre('save', function (next) {
    const currentDate = new Date();
    this.date = currentDate.toISOString().split('T')[0];
    this.time = currentDate.toISOString().split('T')[1].split('.')[0];
    next();
});

const Messages = mongoose.model('Messages', MessagesSchema);
export default Messages;
