import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FavoriteStoresSchema = new Schema({
    store_id: {
        type: Schema.Types.ObjectId,
        ref: 'Stores'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Buyers'
    },
    delivery: {
        type: Schema.Types.Boolean
    }
})

const FavoriteStore = mongoose.model('FavoriteStore', FavoriteStoresSchema);

export default FavoriteStore;
