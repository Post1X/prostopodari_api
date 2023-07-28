import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const SubCategoriesSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true
    },
    sort_number: {
        type: Schema.Types.Number,
        required: true
    },
    category_id: {
        type: Schema.Types.ObjectId,
        ref: 'Categories'
    },
    parameters: {
        type: Schema.Types.Array
    },
    is_active: {
        type: Schema.Types.Boolean
    }
})

const SubCategories = mongoose.model('SubCategories', SubCategoriesSchema);

export default SubCategories;
