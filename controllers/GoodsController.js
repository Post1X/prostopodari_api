import Goods from '../schemas/GoodsSchema';
import mongoose from 'mongoose';
import Buyers from '../schemas/BuyersSchema';
import Favorites from '../schemas/FavoritesSchema';
import FavoriteStore from '../schemas/FavoriteStoresSchema';
import CartsSchema from '../schemas/CartsSchema';
import CartItem from '../schemas/CartItemsSchema';
import Banners from '../schemas/BannersSchema';

// git

class GoodsController {
    static CreateGoods = async (req, res, next) => {
        try {
            // if (!req.isSeller || req.isSeller !== true) {
            //     res.status(400).json({
            //         error: 'У вас нет права находиться на данной странице.'
            //     })
            // }
            let isGettingReadyCheck;
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
                isGettingReady
            } = req.body;
            //
            if (isGettingReady)
            {
                isGettingReadyCheck = true;
            }
            const photoArray = [];
            console.log(req.files)
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                if (file.fieldname === `photo_${i}`) {
                    const logoFile = req.files.find(f => f.fieldname === `photo_${i}`);
                    const parts = logoFile.path.split('public');
                    const result = parts[1].substring(1);
                    photoArray.push(result);
                }
            }
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
                is_promoted: false,
                isGettingReady: isGettingReadyCheck ? isGettingReadyCheck : false
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
            const {user_id} = req;
            const {store_id, stock, sort, category, subcategory, search} = req.query;
            let filter = {};
            if (category) {
                const categoryIds = category.split(',');
                const categoryObjectIds = categoryIds.map(result => mongoose.Types.ObjectId(result.trim()));
                filter.category_id = {$in: categoryObjectIds};
            }
            if (subcategory) {
                const subCategoryIds = subcategory.split(',');
                const subCategoryObjectIds = subCategoryIds.map(result => mongoose.Types.ObjectId(result.trim()));
                filter.subcategory_id = {$in: subCategoryObjectIds};
            }
            if (stock) {
                filter.count = {$lte: 0}
            }
            else
                filter.count = {$gte: 1}
            if (search) {
                filter.title = {$regex: new RegExp(search, 'i')};
            }
            filter.store_id = store_id;
            let goods = [];
            //
            if (sort === 'newFirst' || sort === 'oldFirst') {
                const sortDirection = sort === 'newFirst' ? -1 : 1;
                goods = await Goods.find(filter)
                    .sort({_id: sortDirection})
                    .populate('category_id')
                    .populate('subcategory_id')
                    .populate('store_id')
            } else {
                let sortOptions = {};
                if (sort === 'priceAsc') {
                    sortOptions.price = 1;
                } else if (sort === 'priceDesc') {
                    sortOptions.price = -1;
                }
                if (sort === 'countAsc') {
                    sortOptions.count = 1
                }
                if (sort === 'countDesc') {
                    sortOptions.count = -1;
                }
                goods = await Goods.find(filter)
                    .sort(sortOptions)
                    .populate('category_id')
                    .populate('subcategory_id')
                    .populate('store_id')
            }
            // const user = await Sellers.findOne({
            //     _id: user_id
            // });
            // const rightGoods = goods.filter(good => good.store_id.city ? (good.store_id === user.city) : '')
            const rightGoods = goods.filter(good => good.store_id.seller_user_id.toString() === user_id.toString())
            const promotedGoods = rightGoods.filter(good => good.is_promoted === true);
            const regularGoods = rightGoods.filter(good => good.is_promoted !== true);
            const sortedGoods = [...promotedGoods, ...regularGoods];
            const modifiedGoodsPromise = sortedGoods.map(async (good) => {
                try {
                    const favoriteGood = await Favorites.findOne({
                        user_id: user_id,
                        good_id: good._id
                    });
                    const favoriteStore = await FavoriteStore.findOne({
                        store_id: good.store_id._id
                    })
                    if (favoriteGood) {
                        const price = good.price.toString();
                        const numericPrice = parseFloat(price);
                        return {
                            ...good.toObject(), price: numericPrice, is_favorite: true, store_id: {
                                ...good.store_id.toObject(),
                                is_favoritestore: !!favoriteStore
                            }
                        };
                    }
                    if (!favoriteGood) {
                        const price = good.price.toString();
                        const numericPrice = parseFloat(price);
                        return {
                            ...good.toObject(), price: numericPrice, is_favorite: false, store_id: {
                                ...good.store_id.toObject(),
                                is_favoritestore: !!favoriteStore
                            }
                        };
                    }
                } catch (e) {
                    e.status = 401;
                    next(e);
                }
            });
            const modifiedGoods = await Promise.all(modifiedGoodsPromise);
            res.status(200).json(modifiedGoods);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetAllGoods = async (req, res, next) => {
        try {
            const {user_id} = req;
            const goods = await Goods.find()
                .sort({is_promoted: -1})
                .populate('category_id')
                .populate('store_id')
            const user = await Buyers.findOne({
                _id: user_id
            });
            const rightGoods = goods.filter(good => good.store_id.city === user.city)
            if (rightGoods.length === 0) {
                res.status(300).json({
                    error: 'В вашем регионе нет пока магазинов'
                })
            }
            const modifiedGoodsPromise = rightGoods.map(async (good) => {
                try {
                    const favoriteGood = await Favorites.findOne({
                        user_id: user_id,
                        good_id: good._id
                    });
                    const favoriteStore = await FavoriteStore.findOne({
                        store_id: good.store_id._id
                    })
                    console.log(favoriteStore, '20-130213921039-')
                    if (favoriteGood) {
                        const price = good.price.toString();
                        const numericPrice = parseFloat(price);
                        return {
                            ...good.toObject(), price: numericPrice, is_favorite: true, store_id: {
                                ...good.store_id.toObject(),
                                is_favoritestore: !!favoriteStore
                            }
                        };
                    }
                    if (!favoriteGood) {
                        const price = good.price.toString();
                        const numericPrice = parseFloat(price);
                        return {
                            ...good.toObject(), price: numericPrice, is_favorite: false, store_id: {
                                ...good.store_id.toObject(),
                                is_favoritestore: !!favoriteStore
                            }
                        };
                    }
                } catch (e) {
                    e.status = 401;
                    next(e);
                }
            })
            const modifiedGoods = await Promise.all(modifiedGoodsPromise)
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
            const {user_id} = req;

            const good = await Goods.findOne({
                _id: good_id
            }).populate('store_id');

            const favoriteGood = await Favorites.findOne({
                user_id: user_id,
                good_id: good_id
            });

            const favoriteStore = await FavoriteStore.findOne({
                store_id: good.store_id._id,
                user_id: user_id
            });

            const modifiedGood = {
                ...good.toObject(),
                is_favorite: favoriteGood ? true : false,
                store_id: {
                    ...good.store_id.toObject(),
                    is_favorite_store: favoriteStore ? true : false
                }
            };
            res.status(200).json({good: modifiedGood})
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static UpdateGoods = async (req, res, next) => {
        try {
            // if (!req.isSeller || req.isSeller !== true) {
            //     return res.status(400).json({
            //         error: 'У вас нет права находиться на данной странице.'
            //     });
            // }
            const photoArray = [];
            if (req.files) {
                if (req.files.length !== 0) {
                    req.files.forEach((file, index) => {
                        if (file.fieldname === `photo_${index}`) {
                            const logoFile = req.files.find(f => f.fieldname === `photo_${index}`);
                            const parts = logoFile.path.split('public');
                            const result = parts[1].substring(1);
                            photoArray.push(result);
                        }
                    });
                }
            }
            const {good_id} = req.query;
            const {
                oldphoto_array,
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
            const updatedPhotoArrayMain = [];
            if (oldphoto_array) {
                const splittedOld = oldphoto_array.split(',')
                const updatedPhotoArray = [...splittedOld, ...photoArray];
                updatedPhotoArrayMain.push(...updatedPhotoArray)
            }
            if (subcategory_id) {
                await Goods.findOneAndUpdate(
                    {_id: good_id},
                    {
                        category_id: category_id,
                        subcategory_id: subcategory_id,
                        title: title,
                        count: count,
                        photo_list: updatedPhotoArrayMain,
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
            }
            if (!subcategory_id) {
                await Goods.findOneAndUpdate(
                    {_id: good_id},
                    {
                        category_id: category_id,
                        subcategory_id: null,
                        title: title,
                        count: count,
                        photo_list: updatedPhotoArrayMain,
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
            }
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
            await Favorites.deleteMany({
                items: id
            });
            await CartsSchema.deleteMany({'items[0].good_id': id});
            res.status(200).json({
                message: 'success'
            });
            await CartItem.deleteMany({good_id: id})
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
            })
                .populate('store_id')
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
            const {user_id} = req;
            const {stock, sort, category, subcategory, search, price_from, price_to} = req.query;
            let filter = {};
            if (price_from !== undefined && price_to !== undefined) {
                const numericPriceFrom = parseFloat(price_from);
                const numericPriceTo = parseFloat(price_to);
                if (!isNaN(numericPriceFrom) && !isNaN(numericPriceTo)) {
                    filter.price = {$gte: numericPriceFrom, $lte: numericPriceTo};
                }
            } else if (price_from !== undefined) {
                const numericPriceFrom = parseFloat(price_from);
                if (!isNaN(numericPriceFrom)) {
                    filter.price = {$gte: numericPriceFrom};
                }
            } else if (price_to !== undefined) {
                const numericPriceTo = parseFloat(price_to);
                if (!isNaN(numericPriceTo)) {
                    filter.price = {$lte: numericPriceTo};
                }
            }
            if (category) {
                const categoryIds = category.split(',');
                const categoryObjectIds = categoryIds.map(result => mongoose.Types.ObjectId(result.trim()));
                filter.category_id = {$in: categoryObjectIds};
            }
            if (subcategory) {
                const subCategoryIds = subcategory.split(',');
                const subCategoryObjectIds = subCategoryIds.map(result => mongoose.Types.ObjectId(result.trim()));
                filter.subcategory_id = {$in: subCategoryObjectIds};
            }
            if (stock === 'true') {
                filter.count = {$gte: 1};
            }
            if (search) {
                filter.title = {$regex: new RegExp(search, 'i')};
            }
            let goods = [];

            if (sort === 'newFirst' || sort === 'oldFirst') {
                const sortDirection = sort === 'newFirst' ? -1 : 1;
                goods = await Goods.find(filter)
                    .sort({_id: sortDirection})
                    .populate('category_id')
                    .populate('subcategory_id')
                    .populate('store_id')
            } else {
                let sortOptions = {};
                if (sort === 'priceAsc') {
                    sortOptions.price = 1;
                } else if (sort === 'priceDesc') {
                    sortOptions.price = -1;
                }
                if (sort === 'countAsc') {
                    sortOptions.count = 1
                }
                if (sort === 'countDesc') {
                    sortOptions.count = -1;
                }
                goods = await Goods.find(filter)
                    .sort(sortOptions)
                    .populate('category_id')
                    .populate('subcategory_id')
                    .populate('store_id')
            }
            const user = await Buyers.findOne({
                _id: user_id
            });
            const rightGoods = goods.filter(good => good.store_id.city === user.city)
            if (rightGoods.length === 0) {
                res.status(300).json({
                    error: 'В вашем регионе нет пока магазинов'
                })
            }
            const promotedGoods = rightGoods.filter(good => good.is_promoted === true);
            const regularGoods = rightGoods.filter(good => good.is_promoted !== true);
            const sortedGoods = [...promotedGoods, ...regularGoods];
            const modifiedGoodsPromise = sortedGoods.map(async (good) => {
                try {
                    const favoriteGood = await Favorites.findOne({
                        user_id: user_id,
                        good_id: good._id
                    });
                    const favoriteStore = await FavoriteStore.findOne({
                        store_id: good.store_id._id
                    })
                    if (favoriteGood) {
                        const price = good.price.toString();
                        const numericPrice = parseFloat(price);
                        return {
                            ...good.toObject(), price: numericPrice, is_favorite: true, store_id: {
                                ...good.store_id.toObject(),
                                is_favoritestore: !!favoriteStore
                            }
                        };
                    }
                    if (!favoriteGood) {
                        const price = good.price.toString();
                        const numericPrice = parseFloat(price);
                        return {
                            ...good.toObject(), price: numericPrice, is_favorite: false, store_id: {
                                ...good.store_id.toObject(),
                                is_favoritestore: !!favoriteStore
                            }
                        };
                    }
                } catch (e) {
                    e.status = 401;
                    next(e);
                }
            });
            const modifiedGoods = await Promise.all(modifiedGoodsPromise);
            res.status(200).json(modifiedGoods);
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
    //
    static searchGoods = async (req, res, next) => {
        try {
            const {search} = req.query;
            const filter = {};
            if (search) {
                filter.title = {$regex: new RegExp(search, 'i')};
            }
            const goods = await Goods.find(filter)
                .populate('category_id')
                .populate('store_id')
                .populate('subcategory_id')
            res.status(200).json(goods)
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static getBanner = async (req, res, next) => {
        try {
            const banner = await Banners.findOne({
                isNew: true
            });
            res.status(200).json({
                banner: banner.url
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default GoodsController;
