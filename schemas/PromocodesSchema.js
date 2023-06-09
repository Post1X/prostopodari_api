import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const PromocodesSchema = new Schema({
    text: {
        type: Schema.Types.String,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Buyers'
    },
    use_count: {
        type: Schema.Types.Number,
        required: true
    },
    valid_from: {
        type: Schema.Types.Date,
        required: true
    },
    valid_until: {
        type: Schema.Types.Date,
        required: true
    },
    percentage: {
        type: Schema.Types.Number,
        required: true
    }
})

const Promocodes = mongoose.model('Promocodes', PromocodesSchema)

export default Promocodes;
