import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ReviewsSchema = new Schema({
    user_name: {
        type: Schema.Types.String
    },
    text: {
        type: Schema.Types.String
    },
    store_id: {
        type: Schema.Types.String,
        ref: 'Stores'
    }
})

const Reviews = mongoose.model('Reviews', ReviewsSchema);

export default Reviews;
