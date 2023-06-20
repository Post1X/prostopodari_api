import Stores from '../schemas/StoresSchema';

class StoresController {
    static CreateStore = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            if (req.files && req.files.length > 0) {
                const logoFile = req.files.find(file => file.fieldname === 'logo');
                const headerPhotoFile = req.files.find(file => file.fieldname === 'header_photo');

                if (logoFile) {
                    fs.unlinkSync(logoFile.path);
                }
                if (headerPhotoFile) {
                    fs.unlinkSync(headerPhotoFile.path);
                }
            }
            const {user_id} = req;
            const {city_id, address, categories_ids, subcategories_ids} = req.body;
            const newStores = new Stores({
                seller_user_id: user_id,
                city_id: city_id,
                address: address,
                categories_ids: categories_ids,
                sub_categories_ids: subcategories_ids,
                is_disabled: false
            });
            await newStores.save();
            res.status(200).json({
                message: 'success'
            })
        } catch
            (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static
    GetStore = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const {user_id} = req;
            const store = await Stores.find({
                seller_user_id: user_id
            })
                .populate('categories_ids')
                .populate('sub_categories_ids')
                .populate('city_id')
                .populate('seller_user_id')
            res.status(200).json(store)
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static
    UpdateStore = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const {categories_ids, subcategories_ids} = req.body;
            const {user_id} = req;
            await Stores.findOneAndUpdate({
                seller_user_id: user_id
            }, {
                $set: {
                    categories_ids: categories_ids,
                    subcategories_ids: subcategories_ids
                }
            });
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default StoresController;
