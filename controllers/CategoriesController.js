import Categories from '../schemas/CategoriesSchema';
import SubCategories from '../schemas/SubCategoriesSchema';

class CategoriesController {
    static GetCategories = async (req, res, next) => {
        try {
            const categories = await Categories.find();
            if (categories.length === 0) {
                res.status(400).json({
                    error: 'Лист категорий пуст.'
                })
            }
            res.status(200).json({
                categories
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static CreateCategory = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            const logoFile = req.files.find(file => file.fieldname === 'photo_url');
            const parts = logoFile.path.split('public');
            const result = parts[1].substring(1);
            const {title, sort_number, parameters, comission_percentage} = req.body;
            const newCategory = new Categories({
                title: title,
                sort_number: sort_number,
                parameters: parameters,
                photo_url: result,
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
            const {category_id} = req.query;
            if (!category_id) {
                const subcategories = await SubCategories.find();
                if (subcategories.length === 0) {
                    res.status(400).json({
                        error: 'Лист подкатегорий пуст.'
                    })
                    res.status(200).json({
                        subcategories
                    })
                }
                if (subcategories.length === 0) {
                    res.status(400).json({
                        error: 'Лист подкатегорий пуст.'
                    })
                } else {
                    res.status(200).json({
                        subcategories
                    })
                }
            }
            if (category_id) {
                const subcategories = await SubCategories.find({
                    category_id: category_id
                });
                if (subcategories.length === 0) {
                    res.status(400).json({
                        error: 'Лист подкатегорий пуст.'
                    })
                    res.status(200).json({
                        subcategories
                    })
                }
                if (subcategories.length === 0) {
                    res.status(400).json({
                        error: 'Лист подкатегорий пуст.'
                    })
                } else {
                    res.status(200).json({
                        subcategories
                    })
                }
            }
        } catch
            (e) {
            e.status = 401;
            next(e);
        }
    }
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
                    _id: id
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
