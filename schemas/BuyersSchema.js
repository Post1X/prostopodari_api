import mongoose from 'mongoose';
//
const Schema = mongoose.Schema;

const BuyersSchema = new Schema({
    full_name: {
        type: Schema.Types.String,
        required: true
    },
    phone_number: {
        type: Schema.Types.String,
        required: true
    },
    lat: {
        type: Schema.Types.String
    },
    lon: {
        type: Schema.Types.String
    },
    address: {
        type: Schema.Types.String
    },
    city: {
        type: Schema.Types.String
    }
})

const Buyers = mongoose.model('Buyers', BuyersSchema)

export default Buyers;

