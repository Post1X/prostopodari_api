import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CategoriesSchema = new Schema({
    title: {
        type: Schema.Types.String,
        required: true
    },
    sort_number: {
        type: Schema.Types.Number,
        required: true
    },
    parameters: {
        type: Schema.Types.Array
    },
    comission_percentage: {
        type: Schema.Types.Number
    },
    photo_url: {
        type: Schema.Types.String
    }
})

const Categories = mongoose.model('Categories', CategoriesSchema);

export default Categories;
