import mongoose from 'mongoose';
//
const Schema = mongoose.Schema;

const StoresSchema = new Schema({
    seller_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Sellers'
    },
    city_id: {
        type: Schema.Types.ObjectId,
        ref: 'Cities'
    },
    address: {
        type: Schema.Types.String
    },
    title: {
        type: Schema.Types.String
    },
    subscription_status: {
        type: Schema.Types.String
    },
    subscription_valid_until: {
        type: Schema.Types.Date
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
    }
});

const Stores = mongoose.model('Stores', StoresSchema)


export default Stores;
