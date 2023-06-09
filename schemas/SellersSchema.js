import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const SellersSchema = new Schema({
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
        required: true
    },
    ip: {
        type: Schema.Types.String,
        required: true
    },
    ogrn: {
        type: Schema.Types.String,
        required: true
    },
    stores_title: {
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
    logo_url: {
        type: Schema.Types.String,
        required: true
    },
    header_photo_url: {
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
    }
})

const Sellers = mongoose.model('Sellers', SellersSchema)

export default Sellers;
