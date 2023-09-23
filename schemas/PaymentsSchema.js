import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PaymentsSchema = new Schema({
    seller_id: {
        type: Schema.Types.ObjectId,
        ref: 'Sellers'
    },
    order_id: {
        type: Schema.Types.String
    },
    forSub: {
        type: Schema.Types.Boolean
    }
})

const Payments = mongoose.model('Payments', PaymentsSchema);

export default Payments;
