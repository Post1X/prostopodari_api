import mongoose from 'mongoose';

const Schema = mongoose.Schema;
//

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
        type: Schema.Types.String
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
    delivery_price: {
        type: Schema.Types.Decimal128
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
    postcard: {
        type: Schema.Types.String
    },
    comment: {
        type: Schema.Types.String
    },
    paid: {
        type: Schema.Types.Boolean
    },
    paymentCard: {
        type: Schema.Types.String
    },
    promocodeComission: {
        type: Schema.Types.Number
    },
    comission: {
        type: Schema.Types.Number
    },
    phone_number: {
        type: Schema.Types.String
    },
    name: {
        type: Schema.Types.String
    }
})

const Orders = mongoose.model('Orders', OrdersSchema)

export default Orders;
