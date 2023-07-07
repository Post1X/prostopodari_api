import Goods from '../schemas/GoodsSchema';
import mongoose from 'mongoose';

// git

class GoodsController {
    static CreateGoods = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const {
                category_id,
                subcategory_id,
                title,
                count,
                time_to_get_ready,
                store_id,
                short_description,
                price,
                parameters,
            } = req.body;
            //
            const photoArray = [];
            req.files.forEach((file, index) => {
                if (file.fieldname === `photo_${index}`) {
                    const logoFile = req.files.find(f => f.fieldname === `photo_${index}`);
                    const parts = logoFile.path.split('public');
                    const result = parts[1].substring(1);
                    photoArray.push(result);
                }
            });
            //
            const newGoods = new Goods({
                category_id: category_id,
                subcategory_id: subcategory_id,
                title: title,
                count: count,
                time_to_get_ready: time_to_get_ready,
                store_id: store_id,
                photo_list: photoArray,
                short_description: short_description,
                price: price,
                parameters: parameters,
                is_promoted: false
            });
            await newGoods.save();
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetGoods = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                return res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                });
            }
            const {store_id} = req.query;
            const goods = await Goods.find({store_id}).sort({is_promoted: -1})
                .populate('category_id')
                .populate('subcategory_id')
                .exec();
            const modifiedGoods = goods.map((item) => {
                const number = item.price.toString();
                const numericPrice = parseFloat(number);
                return {...item._doc, price: numericPrice};
            });
            return res.status(200).json(modifiedGoods);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetAllGoods = async (req, res, next) => {
        try {
            const goods = await Goods.find({}).sort({is_promoted: -1});

            const modifiedGoods = goods.map((good) => {
                const price = good.price.toString();
                const numericPrice = parseFloat(price);
                return {...good.toObject(), price: numericPrice};
            });
            res.status(200).json(modifiedGoods);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetOneGood = async (req, res, next) => {
        try {
            const {good_id} = req.query;
            const good = await Goods.findOne({
                _id: good_id
            });
            res.status(200).json(good)
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static UpdateGoods = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                return res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                });
            }
            console.log(req.files);
            console.log(req.file)
            const photoArray = [];
            req.files.forEach((file, index) => {
                if (file.fieldname === `photo_${index}`) {
                    const logoFile = req.files.find(f => f.fieldname === `photo_${index}`);
                    const parts = logoFile.path.split('public');
                    const result = parts[1].substring(1);
                    photoArray.push(result);
                }
            });
            const {good_id} = req.query;
            const {
                category_id,
                subcategory_id,
                title,
                count,
                time_to_get_ready,
                store_id,
                short_description,
                price,
                parameters
            } = req.body;

            const good = await Goods.findById(good_id).populate('photo_list');
            console.log(good.photo_list)
            const updatedPhotoArray = [...good.photo_list, ...photoArray];
            await Goods.findOneAndUpdate(
                {_id: good_id},
                {
                    category_id: category_id,
                    subcategory_id: subcategory_id,
                    title: title,
                    count: count,
                    photo_list: updatedPhotoArray,
                    time_to_get_ready: time_to_get_ready,
                    store_id: store_id,
                    short_description: short_description,
                    price: price,
                    parameters: parameters
                }
            );

            res.status(200).json({
                message: 'success'
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static DeleteGoods = async (req, res, next) => {
        try {
            const {id} = req.params;
            await Goods.findByIdAndDelete({
                _id: id
            });
            res.status(200).json({
                message: 'success'
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static PromoteGoods = async (req, res, next) => {
        try {
            const {good_id} = req.params;
            console.log(good_id)
            const good = await Goods.findOne({
                _id: good_id
            });
            console.log(good.is_promoted === true)
            if (good.is_promoted === true) {
                await Goods.findByIdAndUpdate({_id: good_id}, {
                    is_promoted: false
                });
                res.status(200).json({
                    message: 'success'
                })
            }
            if (good.is_promoted === false) {
                await Goods.findByIdAndUpdate({_id: good_id},
                    {
                        is_promoted: true
                    })
            }
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    static FilterGoods = async (req, res, next) => {
        try {
            const {sort, category, subcategory, search} = req.query;
            let filter = {};

            if (category) {
                const categoryIds = category.split(',');
                const categoryObjectIds = categoryIds.map(result => mongoose.Types.ObjectId(result.trim()));
                filter.category_id = {$in: categoryObjectIds};
            }
            if (subcategory) {
                const subCategoryIds = subcategory.split(','); // Исправлено: использовать 'subcategory' вместо 'category'
                const subCategoryObjectIds = subCategoryIds.map(result => mongoose.Types.ObjectId(result.trim()));
                filter.subcategory_id = {$in: subCategoryObjectIds};
            }
            if (search) {
                // Добавлено условие поиска по полю 'title' с использованием регулярного выражения
                filter.title = {$regex: new RegExp(search, 'i')};
            }

            let goods = [];

            if (sort === 'newFirst' || sort === 'oldFirst') {
                const sortDirection = sort === 'newFirst' ? -1 : 1;
                goods = await Goods.find(filter)
                    .sort({_id: sortDirection})
                    .populate('category_id')
                    .populate('subcategory_id')
                    .populate('store_id');
            } else {
                let sortOptions = {};
                if (sort === 'priceAsc') {
                    sortOptions.price = 1;
                } else if (sort === 'priceDesc') {
                    sortOptions.price = -1;
                }
                goods = await Goods.find(filter)
                    .sort(sortOptions);
            }

            const promotedGoods = goods.filter(good => good.is_promoted === true);
            const regularGoods = goods.filter(good => good.is_promoted !== true);
            const sortedGoods = [...promotedGoods, ...regularGoods];

            res.status(200).json(sortedGoods);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static DeletePhotos = async (req, res, next) => {
        try {
            const {photo, good_id} = req.query;
            const updatedGoods = await Goods.findByIdAndUpdate(
                good_id,
                {$pull: {photo_list: photo}},
                {new: true}
            );
            if (!updatedGoods) {
                return res.status(404).json({
                    error: 'Товар не найден'
                });
            }
            res.status(200).json({
                message: 'success'
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default GoodsController;
