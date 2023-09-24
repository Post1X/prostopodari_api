import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const BannersSchema = new Schema({
    url: {
        type: Schema.Types.String
    },
    isNew: {
        type: Schema.Types.Boolean
    }
})

const Banners = mongoose.model('Banners', BannersSchema);

export default Banners;
