import Stores from '../schemas/StoresSchema';

class StoresController {
    static CreateStore = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                })
            }
            // if (req.files && req.files.length > 0) {
            //     const logoFile = req.files.find(file => file.fieldname === 'logo');
            //     if (logoFile) {
            //         fs.unlinkSync(logoFile.path);
            //     }
            // }
            const logoFile = req.files.find(file => file.fieldname === 'logo');
            const {user_id} = req;
            const parts = logoFile.path.split('public');
            const result = parts[1].substring(1);
            const {city_id, address, title, about_store} = req.body;
            const newStores = new Stores({
                seller_user_id: user_id,
                city_id: city_id,
                address: address,
                title: title,
                logo_url: result,
                about_store: about_store,
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
                    error: 'У вас нет права находиться на данной странице.',
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
            const logoFile = req.files.find(file => file.fieldname === 'logo');
            const {user_id} = req;
            const parts = logoFile.path.split('public');
            const result = parts[1].substring(1);
            const {store_id} = req.query;
            const {city_id, address, title, about_store} = req.body;
            await Stores.findByIdAndUpdate({
                    _id: store_id
                },
                {
                    city_id: city_id,
                    address: address,
                    title: title,
                    about_store: about_store,
                    logo_url: result
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
    static
    DeleteStore = async (req, res, next) => {
        try {
            const {store_id} = req.query;
            await Stores.findOneAndDelete({
                _id: store_id
            })
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
