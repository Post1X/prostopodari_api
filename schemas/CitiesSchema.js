import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CitiesSchema = new Schema({
    name: {
        type: Schema.Types.String
    },
    is_active: {
        type: Schema.Types.Boolean
    }
})

const Cities = mongoose.model('Cities', CitiesSchema)

export default Cities
