import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const BuyersSchema = new Schema({
    email: {
        type: Schema.Types.String,
        required: true
    },
    password: {
        type: Schema.Types.String,
        required: true
    },
    full_name: {
        type: Schema.Types.String,
        required: true
    },
    phone_number: {
        type: Schema.Types.String,
        required: true
    },
    significant_dates: {
        type: Schema.Types.Array
    }
})

const Buyers = mongoose.model('Buyers', BuyersSchema)

export default Buyers;

