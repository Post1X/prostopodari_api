import mongoose from 'mongoose';
//
const Schema = mongoose.Schema;

const StoresSchema = new Schema({
    seller_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Sellers'
    },
    title: {
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
    logo_url: {
        type: Schema.Types.String,
        required: true
    },
    about_store: {
        type: Schema.Types.String
    },
    categories_ids: {
        type: Schema.Types.Array,
        ref: 'Categories'
    },
    sub_categories_ids: {
        type: Schema.Types.Array,
        ref: 'SubCategories'
    },
    is_disabled: {
        type: Schema.Types.Boolean
    },
    comission: {
        type: Schema.Types.Number
    },
    lat: {
        type: Schema.Types.String
    },
    lon: {
        type: Schema.Types.String
    },
    address: {
        type: Schema.Types.String
    },
    city: {
        type: Schema.Types.String
    },
    distance: {
        type: Schema.Types.Decimal128
    },
    weekdays: {
        type: Schema.Types.Mixed
    },
    weekends: {
        type: Schema.Types.Mixed
    }
});

const Stores = mongoose.model('Stores', StoresSchema)


export default Stores;
