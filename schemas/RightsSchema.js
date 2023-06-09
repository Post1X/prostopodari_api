import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PrivacySchema = new Schema({
    text: {
        type: Schema.Types.String
    },
    store_id: {
        type: Schema.Types.ObjectId,
        ref: 'Stores'
    }
})

// const FaqSchema = new Schema({
//     questions: {
//         type: Schema.Types.Array
//     },
//     answers: {
//         type: Schema.Types.Array
//     }
// })

const TermsSchema = new Schema({
    text: {
        type: Schema.Types.String
    },
    store_id: {
        type: Schema.Types.ObjectId,
        ref: 'Stores'
    }
})

const Privacy = mongoose.model('Privacy', PrivacySchema)
const Terms = mongoose.model('Terms', TermsSchema)

export {Privacy, Terms};
