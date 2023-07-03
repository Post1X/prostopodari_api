import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const OrdersSchema = new Schema({
    goods_ids: {
        type: Schema.Types.Array,
        ref: 'Goods'
    },
    store_id: {
        type: Schema.Types.ObjectId,
        ref: 'Stores'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Buyers'
    },
    delivery_date: {
        type: Schema.Types.Date
    },
    delivery_time: {
        type: Schema.Types.String
    },
    delivery_address: {
        type: Schema.Types.String,
    },
    delivery_info: {
        type: Schema.Types.String,
    },
    full_amount: {
        type: Schema.Types.Decimal128,
    },
    payment_type: {
        type: Schema.Types.String,
    },
    commission_percentage: {
        type: Schema.Types.Number
    },
    income: {
        type: Schema.Types.Decimal128
    },
    status_id: {
        type: Schema.Types.ObjectId,
        ref: 'OrdStatuses'
    },
    promocode: {
        type: Schema.Types.String,
        ref: 'Promocodes'
    },
    need_postcard: {
        type: Schema.Types.Boolean
    },
    comment: {
        type: Schema.Types.String
    }
})

const Orders = mongoose.model('Orders', OrdersSchema)

export default Orders;
