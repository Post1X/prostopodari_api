import mongoose from 'mongoose';

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
        type: Schema.Types.String
    },
    subscription_valid_until: {
        type: Schema.Types.String
    },
    active_store: {
        type: Schema.Types.ObjectId,
        default: null
    }
})

const Sellers = mongoose.model('Sellers', SellersSchema)

export default Sellers;
