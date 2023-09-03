import mongoose from 'mongoose';
//
const Schema = mongoose.Schema;

const SellersSchema = new Schema({
    name: {
        type: Schema.Types.String,
    },
    email: {
        type: Schema.Types.String,
        required: true
    },
    password: {
        type: Schema.Types.String,
        required: true
    },
    inn: {
        type: Schema.Types.String,
    },
    ip: {
        type: Schema.Types.String,
    },
    ogrn: {
        type: Schema.Types.String,
    },
    legal_name: {
        type: Schema.Types.String,
        required: true
    },
    phone_number: {
        type: Schema.Types.String,
        required: true
    },
    bill_number: {
        type: Schema.Types.String,
        required: true
    },
    status: {
        type: Schema.Types.String
    },
    message_from_admin: {
        type: Schema.Types.String
    },
    subscription_status: {
        type: Schema.Types.Boolean,
        default: false
    },
    subscription_count: {
        type: Schema.Types.Number,
        default: null
    },
    subscription_until: {
        type: Schema.Types.Date,
        default: null
    },
    active_store: {
        type: Schema.Types.ObjectId,
        ref: 'Stores',
        default: null
    },
    is_banned: {
        type: Schema.Types.Boolean,
        default: false
    },
    isChatCreate: {
        type: Schema.Types.Boolean,
        default: false
    }
})

const Sellers = mongoose.model('Sellers', SellersSchema)

export default Sellers;
