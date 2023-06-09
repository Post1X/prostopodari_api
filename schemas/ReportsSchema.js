import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ReportsSchema = new Schema({
    message_from_buyer: {
        type: Schema.Types.Array,
        required: true
    },
    status: {
        type: Schema.Types.String
    },
    store_id: {
        type: Schema.Types.ObjectId,
        ref: 'Stores'
    },
    buyer_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Buyers'
    }
})

const Reports = mongoose.model('Reports', ReportsSchema)

export default Reports;
