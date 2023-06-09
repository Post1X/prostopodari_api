import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const StoresSchema = new Schema({
    user_id: {
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
    subscription_status: {
        type: Schema.Types.String
    },
    subscription_valid_until: {
        type: Schema.Types.Date
    },
    categories_ids: {
        type: Schema.Types.Array
    },
    sub_categories_ids: {
        type: Schema.Types.Array
    },
    is_disabled: {
        type: Schema.Types.Boolean
    }
});

const Stores = mongoose.model('Stores', StoresSchema)


export default Stores;
