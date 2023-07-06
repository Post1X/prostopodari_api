import Stores from '../schemas/StoresSchema';
import Sellers from '../schemas/SellersSchema';

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
            const store = Stores.findOne({
                seller_user_id: user_id
            });
            await Sellers.findByIdAndUpdate({
                _id: user_id
            }, {
                active_store: store._id
            })
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
            const store = await Stores.find({
                seller_user_id: user_id
            })
            if (!store) {
                res.status(400).json({
                    error: 'У вас нет магазинов'
                })
            }
            if (store.length >= 2)
                await Sellers.findOneAndUpdate({
                    _id: user_id
                }, {
                    active_store: store[1]._id
                });
            if (store.length === 1) {
                await Sellers.findOneAndUpdate({
                    _id: user_id
                }, {
                    active_store: store[0]._id
                });
            }
            if (store.length === 0) {
                res.status(400).json({
                    error: 'У пользователя больше нет магазинов'
                })
            }
            const seller = await Sellers.findOne({
                _id: user_id
            })
                .populate('active_store')
//
            res.status(200).json({
                seller
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static DeleteStore = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {store_id} = req.query;
            const storeCheck = await Stores.findOne({
                _id: store_id
            })
            const sellerCheck = await Sellers.findOne({
                _id: user_id
            })
            if (!storeCheck) {
                res.status(400).json({
                    error: 'Такого магазина не существует или список магазинов пуст'
                });
            }
            await Stores.findOneAndDelete({
                _id: storeCheck._id
            });
            if (!storeCheck) {
                res.status(400).json({
                    error: 'У вас нет магазинов'
                })
            }
            //
            if (sellerCheck.active_store === null) {
                if (storeCheck.length >= 2)
                    await Sellers.findOneAndUpdate({
                        _id: user_id
                    }, {
                        active_store: storeCheck[1]._id
                    });
                if (storeCheck.length === 1) {
                    await Sellers.findOneAndUpdate({
                        _id: user_id
                    }, {
                        active_store: storeCheck[0]._id
                    });
                }
                if (storeCheck.length === 0) {
                    res.status(400).json({
                        error: 'У пользователя больше нет магазинов'
                    })
                }
            }
            const seller = await Sellers.findOne({_id: user_id})
                .populate({
                    path: 'active_store',
                    populate: {
                        path: 'city_id'
                    }
                });
            res.status(200).json({
                seller,
                storesList: storeCheck
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    };
}

export default StoresController;
