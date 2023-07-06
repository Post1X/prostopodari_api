import mongoose from 'mongoose';
//
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
    city_id: {
        type: Schema.Types.ObjectId,
        ref: 'Cities'
    },
    address: {
        type: Schema.Types.String
    }
})

const Buyers = mongoose.model('Buyers', BuyersSchema)

export default Buyers;

