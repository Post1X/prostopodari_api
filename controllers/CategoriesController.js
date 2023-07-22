import Categories from '../schemas/CategoriesSchema';
import Goods from '../schemas/GoodsSchema';
import SubCategories from '../schemas/SubCategoriesSchema';
import Sellers from '../schemas/SellersSchema';
import Stores from '../schemas/StoresSchema';

//
class CategoriesController {
    static GetCategories = async (req, res, next) => {
        try {
            const {seller_id} = req.query;
            if (seller_id) {
                console.log('alo')
                const seller = await Sellers.findOne({
                    _id: seller_id
                });
                const seller_activestore = seller.active_store;
                const activestore = await Stores.findOne({
                    _id: seller_activestore
                });
                if (activestore) {
                    const goodsInActiveStore = await Goods.find({
                        store_id: activestore._id
                    });
                    if (goodsInActiveStore.length === 0) {
                        return res.status(400).json({
                            error: 'Нет товаров в активном магазине.'
                        });
                    }
                    const categoryCountMap = {};
                    goodsInActiveStore.forEach((goods) => {
                        const {category_id} = goods;
                        if (category_id) {
                            if (!categoryCountMap[category_id]) {
                                categoryCountMap[category_id] = 1;
                            } else {
                                categoryCountMap[category_id]++;
                            }
                        }
                    });
                    const categories = await Categories.find({
                        _id: {$in: Object.keys(categoryCountMap)}
                    });
                    if (categories.length === 0) {
                        return res.status(400).json({
                            error: 'Нет категорий у товаров в активном магазине.'
                        });
                    }
                    const categoriesWithProductCount = categories.map((category) => {
                        const categoryId = category._id.toString();
                        const productCount = categoryCountMap[categoryId] || 0;
                        return {
                            ...category.toJSON(),
                            productCount
                        };
                    });

                    res.status(200).json({
                        categories: categoriesWithProductCount
                    });
                }
                if (!activestore) {
                    res.status(401).json({
                        error: 'У вас нет активного магазина'
                    })
                }
            } else {
                const categories = await Categories.find();
                if (categories.length === 0) {
                    return res.status(400).json({
                        error: 'Лист категорий пуст.'
                    });
                }
                const categoriesWithProductCount = await Promise.all(
                    categories.map(async (category) => {
                        const productCount = await Goods.countDocuments({category_id: category._id});
                        return {
                            ...category.toJSON(),
                            productCount
                        };
                    })
                );
                res.status(200).json({
                    categories: categoriesWithProductCount
                });
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    };

    //
    static CreateCategory = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const {title, sort_number, parameters, comission_percentage} = req.body;

            if (req.files.length !== 0) {
                const logoFile = req.files.find(file => file.fieldname === 'photo_url');
                const parts = logoFile.path.split('public');
                const result = parts[1].substring(1);
                const newCategory = new Categories({
                    title: title,
                    sort_number: sort_number,
                    parameters: parameters,
                    photo_url: result,
                    comission_percentage: comission_percentage,
                });
                await newCategory.save();
            }
            const newCategory = new Categories({
                title: title,
                sort_number: sort_number,
                parameters: parameters,
                comission_percentage: comission_percentage,
            })
            const category = await newCategory.save();
            res.status(200).json({
                message: 'Success.'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static UpdateCategory = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const {id, title, sort_number, parameters, comission_percentage} = req.body;
            const {filename, destination} = req.file;
            const category = await Categories.findByIdAndUpdate({_id: id},
                {
                    $set: {
                        title: title,
                        sort_number: sort_number,
                        parameters: parameters,
                        comission_percentage: comission_percentage,
                        photo_url: `${destination + filename}`
                    }
                });
            const updatedCategory = await Categories.findOne({
                _id: id
            })
            res.status(200).json({
                updatedCategory
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static DeleteCategory = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const {id} = req.params;
            const subcategory = await SubCategories.findOne({
                _id: id
            });
            if (!subcategory) {
                res.status(400).json({
                    error: 'Такой подкатегории не существует.'
                })
            }
            if (subcategory) {
                await Categories.findByIdAndDelete({
                    _id: id
                })
                res.status(200).json({
                    message: 'Success.'
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static CreateSubCategory = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const {category_id, title, parameters, sort_number} = req.body;
            const subcategory = await SubCategories.findOne({
                name: title,
                sort_number: sort_number
            });
            if (subcategory) {
                res.status(400).json({
                    error: 'Подкатегория с такими данными уже существует.'
                })
            }
            const newSubCategory = new SubCategories({
                name: title,
                sort_number: sort_number,
                parameters: parameters,
                category_id: category_id
            });
            await newSubCategory.save();
            res.status(200).json({
                message: 'Success.'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetSubCategories = async (req, res, next) => {
        try {
            const { seller_id } = req.query;
            if (seller_id) {
                const seller = await Sellers.findOne({
                    _id: seller_id
                });
                const seller_activestore = seller.active_store;
                const activestore = await Stores.findOne({
                    _id: seller_activestore
                });
                if (activestore) {
                    const goodsInActiveStore = await Goods.find({
                        store_id: activestore._id
                    });
                    if (goodsInActiveStore.length === 0) {
                        return res.status(400).json({
                            error: 'Нет товаров в активном магазине.'
                        });
                    }
                    const subcategoryCountMap = {};
                    goodsInActiveStore.forEach((goods) => {
                        const { subcategory_id } = goods;
                        if (subcategory_id) {
                            if (!subcategoryCountMap[subcategory_id]) {
                                subcategoryCountMap[subcategory_id] = 1;
                            } else {
                                subcategoryCountMap[subcategory_id]++;
                            }
                        }
                    });
                    const subcategories = await SubCategories.find({
                        _id: { $in: Object.keys(subcategoryCountMap) }
                    });
                    if (subcategories.length === 0) {
                        return res.status(400).json({
                            error: 'Нет субкатегорий у товаров в активном магазине.'
                        });
                    }
                    const subcategoriesWithProductCount = subcategories.map((subcategory) => {
                        const subcategoryId = subcategory._id.toString();
                        const productCount = subcategoryCountMap[subcategoryId] || 0;
                        return {
                            ...subcategory.toJSON(),
                            productCount
                        };
                    });

                    res.status(200).json({
                        subcategories: subcategoriesWithProductCount
                    });
                } else {
                    res.status(401).json({
                        error: 'У вас нет активного магазина'
                    });
                }
            } else {
                const subcategories = await SubCategories.find();
                if (subcategories.length === 0) {
                    return res.status(400).json({
                        error: 'Лист субкатегорий пуст.'
                    });
                }
                const subcategoriesWithProductCount = await Promise.all(
                    subcategories.map(async (subcategory) => {
                        const productCount = await Goods.countDocuments({ subcategory_id: subcategory._id });
                        return {
                            ...subcategory.toJSON(),
                            productCount
                        };
                    })
                );
                res.status(200).json({
                    subcategories: subcategoriesWithProductCount
                });
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    };

    //
    static
    UpdateSubCategory = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const {id, category_id, title, parameters, sort_number} = req.body;
            const subcategory = await SubCategories.findOne({
                _id: id
            })
            if (!subcategory) {
                res.status(400).json({
                    error: 'Подкатегории с введенными данными не существует.'
                })
            } else {
                await SubCategories.findByIdAndUpdate({
                    _id: id,
                }, {
                    $set: {
                        category_id: category_id,
                        name: title,
                        parameters: parameters,
                        sort_number: sort_number
                    }
                })
                res.status(200).json({
                    message: 'Success.'
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static
    DeleteSubCategory = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const {id} = req.params;
            const subcategory = await SubCategories.findOne({
                _id: id
            })
            if (!subcategory) {
                res.status(400).json({
                    error: 'Подкатегория с введенными данными отсутствует.'
                })
            } else {
                await SubCategories.findOneAndDelete({
                    _id: id
                });
                res.status(200).json({
                    message: 'Success.'
                })
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}


export default CategoriesController;
