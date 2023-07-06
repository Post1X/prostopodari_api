import mongoose from 'mongoose';
//
const Schema = mongoose.Schema;

const GoodsSchema = new Schema({
    category_id: {
        type: Schema.Types.ObjectId,
        ref: 'Categories'
    },
    subcategory_id: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategories',
    },
    is_promoted: {
        type: Schema.Types.Boolean
    },
    title: {
        type: Schema.Types.String,
        required: true
    },
    photo_list: {
        type: Schema.Types.Array
    },
    count: {
        type: Schema.Types.Number
    },
    time_to_get_ready: {
        type: Schema.Types.Number
    },
    store_id: {
        type: Schema.Types.ObjectId,
        ref: 'Stores'
    },
    seller_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Sellers'
    },
    short_description: {
        type: Schema.Types.String
    },
    price: {
        type: Schema.Types.Decimal128,
        required: true
    },
    parameters: {
        type: Schema.Types.Mixed
    }
})

const Goods = mongoose.model('Goods', GoodsSchema);

export default Goods;
