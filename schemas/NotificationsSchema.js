import mongoose from 'mongoose';

const Schema = mongoose.Schema;
//
const NotificationsSchema = new Schema({
    date: {
        type: Schema.Types.String
    },
    role: {
        type: Schema.Types.String
    },
    title: {
        type: Schema.Types.String
    },
    body: {
        type: Schema.Types.String
    }
})

const Notifications = mongoose.model('Notifications', NotificationsSchema)

export default Notifications;
