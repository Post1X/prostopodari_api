import mongoose from 'mongoose';
//
const Schema = mongoose.Schema;

const FavoritesSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Buyers'
    },
    good_id: {
        type: Schema.Types.ObjectId,
        ref: 'Goods'
    },
    store_id: {
        type: Schema.Types.ObjectId,
        ref: 'Stores'
    }
})

const Favorites = mongoose.model('Favorites', FavoritesSchema)

export default Favorites;
