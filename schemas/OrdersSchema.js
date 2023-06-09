import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const OrdStatusesSchema = new Schema({
    name: {
        type: Schema.Types.String
    }
})

const OrdStatuses = mongoose.model('OrdStatuses', OrdStatusesSchema)


const OrdersSchema = new Schema({
    goods_ids: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Goods'
    }],
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
    delivery_address: {
        type: Schema.Types.String,
        required: true
    },
    delivery_info: {
        type: Schema.Types.String,
        required: true
    },
    full_amount: {
        type: Schema.Types.Decimal128,
        required: true
    },
    payment_type: {
        type: Schema.Types.String,
        required: true
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
        type: Schema.Types.ObjectId,
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
