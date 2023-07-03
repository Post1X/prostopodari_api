import Goods from '../schemas/GoodsSchema';
import mongoose from 'mongoose';

class GoodsController {
    static CreateGoods = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const photoArray = [];
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
            req.files.forEach((file, index) => {
                if (file.fieldname === `photo_${index}`) {
                    const filePath = `${file.destination}${file.filename}`;
                    photoArray.push(filePath);
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
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const {store_id} = req.query;
            const goods = await Goods.find({store_id: store_id}).sort({is_promoted: -1})
                .populate('category_id')
                .exec()
            res.status(200).json(
                goods
            )
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
    static UpdateGoods = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const {
                id,
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
            //
            console.log(id)
            await Goods.findByIdAndUpdate({
                _id: id
            }, {
                category_id: category_id,
                subcategory_id: subcategory_id,
                title: title,
                count: count,
                time_to_get_ready: time_to_get_ready,
                store_id: store_id,
                short_description: short_description,
                price: price,
                parameters: parameters
            })
            res.status(200).json({
                message: 'success'
            })
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
            })
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
            const {sort, category, subcategory} = req.query;
            let filter = {};
            if (category) {
                const categoryIds = category.split(',');
                const categoryObjectIds = categoryIds.map(result => mongoose.Types.ObjectId(result.trim()));
                filter.category_id = {$in: categoryObjectIds};
            }
            if (subcategory) {
                filter.subcategory_id = subcategory;
            }
            let goods = [];
            if ((sort === 'newFirst' || sort === 'oldFirst')) {
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
    };
}

export default GoodsController;
