import mongoose from 'mongoose';

const Schema = mongoose.Schema;
//

const TempOrdersSchema = new Schema({
    goods_ids: {
        type: Schema.Types.Array,
        ref: 'Goods'
    },
    title: {
        type: Schema.Types.String
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
    delivery_city: {
        type: Schema.Types.String
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
    },
    count: {
        type: Schema.Types.Array
    },
    isNew: {
        type: Schema.Types.Boolean,
        default: true
    },
    goods: {
        type: Schema.Types.Array
    },
    creationDate: {
        type: Schema.Types.Date
    },
})

const TempOrders = mongoose.model('TempOrders', TempOrdersSchema)

export default TempOrders;
