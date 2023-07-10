import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const PromocodesSchema = new Schema({
    text: {
        type: Schema.Types.String,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Buyers'
    },
    date: {
        type: Schema.Types.String
    },
    percentage: {
        type: Schema.Types.Number,
    },
    event_name: {
        type: Schema.Types.String
    },
    priority: {
        type: Schema.Types.String
    }
})

const Promocodes = mongoose.model('Promocodes', PromocodesSchema)

export default Promocodes;

