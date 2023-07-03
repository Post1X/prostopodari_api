import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const OrdStatusesSchema = new Schema({
    name: {
        type: Schema.Types.String
    }
})

const OrdStatuses = mongoose.model('OrdStatuses', OrdStatusesSchema)

export default OrdStatuses;
