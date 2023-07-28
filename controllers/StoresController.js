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
            const {user_id} = req;
            const {lon, lat} = req.query;
            const {address, title, about_store, city} = req.body;
            if (req.files.length !== 0) {
                const logoFile = req.files.find(file => file.fieldname === 'logo');
                const parts = logoFile.path.split('public');
                const comission = 30;
                const result = parts[1].substring(1);
                const newStores = new Stores({
                    seller_user_id: user_id,
                    address: address,
                    title: title,
                    comission: 30,
                    logo_url: result,
                    about_store: about_store,
                    is_disabled: false,
                    lon: lon,
                    lat: lat,
                    city: city
                });
                await newStores.save();
            }
            const store = Stores.findOne({
                seller_user_id: user_id
            });
            const storeCheck = await Stores.findOne({
                title: title,
                seller_user_id: user_id
            });
            const storesCheck = await Stores.find({
                seller_user_id: user_id
            });
            const sellerCheck = await Sellers.findOne({
                _id: user_id
            });
            if (storesCheck.length === 0) {
                await Sellers.findOneAndUpdate(
                    {_id: user_id},
                    {active_store: null}
                );
                return res.status(400).json({
                    error: 'У пользователя больше нет магазинов'
                });
            }
            if (!storeCheck) {
                return res.status(400).json({
                    error: 'Неправильный магазин'
                });
            }
            if (storesCheck.length >= 2) {
                console.log('length > 2');
                const deletedStoreIndex = storesCheck.findIndex(store => store._id.toString() === storeCheck._id);
                if (deletedStoreIndex !== -1) {
                    storesCheck.splice(deletedStoreIndex, 1);
                    const newActiveStoreId = storesCheck[storesCheck.length - 1]._id;
                    await Sellers.findOneAndUpdate(
                        {_id: user_id},
                        {active_store: newActiveStoreId}
                    );
                }
            }
            if (storesCheck.length === 1) {
                console.log('length = 1');
                await Sellers.findOneAndUpdate(
                    {_id: user_id},
                    {active_store: storesCheck[0]._id}
                );
            }
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
            const photoArray = [];
            const {user_id} = req;
            console.log(req.files, 'reqfiles');
            console.log(req.file, 'reqfile');
            if (req.files.length !== 0) {
                const logoFile = req.files.find(file => file.fieldname === 'logo');
                const parts = logoFile.path.split('public');
                const result = parts[1].substring(1);
                photoArray.push(result)
            }
            const {store_id} = req.query;
            const {address, title, about_store, city} = req.body;
            const storeCheck = await Stores.findOne({
                _id: store_id
            });
            const storesCheck = await Stores.find({
                seller_user_id: user_id
            });
            if (photoArray.length !== 0)
                await Stores.findByIdAndUpdate({
                        _id: store_id
                    },
                    {
                        city_id: city,
                        address: address,
                        title: title,
                        about_store: about_store,
                        logo_url: photoArray
                    });
            if (photoArray.length === 0) {
                await Stores.findByIdAndUpdate({
                        _id: store_id
                    },
                    {
                        city_id: city,
                        address: address,
                        title: title,
                        about_store: about_store,
                    });
            }
            const store = await Stores.find({
                seller_user_id: user_id
            })
            if (!store) {
                res.status(400).json({
                    error: 'У вас нет магазинов'
                })
            }
            if (storesCheck.length >= 2) {
                console.log('length > 2');
                const deletedStoreIndex = storesCheck.findIndex(store => store._id.toString() === store_id);
                if (deletedStoreIndex !== -1) {
                    storesCheck.splice(deletedStoreIndex, 1);
                    const newActiveStoreId = storesCheck[storesCheck.length - 1]._id;
                    await Sellers.findOneAndUpdate(
                        {_id: user_id},
                        {active_store: newActiveStoreId}
                    );
                }
            }
            if (storesCheck.length === 1) {
                console.log('length = 1');
                await Sellers.findOneAndUpdate(
                    {_id: user_id},
                    {active_store: storesCheck[0]._id}
                );
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
            const storeToReturn = await Stores.findOne({
                _id: store_id
            }).populate('city_id')
            res.status(200).json({
                storeToReturn
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    static DeleteStore = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {store_id} = req.query;
            const storeCheck = await Stores.findOne({
                _id: store_id
            });
            const storesCheck = await Stores.find({
                seller_user_id: user_id
            });
            const sellerCheck = await Sellers.findOne({
                _id: user_id
            });
            const activeStoreCheck = await Stores.findOne({
                _id: sellerCheck.active_store
            });
            console.log(storesCheck.length, 'storechecklength');
            if (storesCheck.length === 0) {
                await Sellers.findOneAndUpdate(
                    {_id: user_id},
                    {active_store: null}
                );
                return res.status(400).json({
                    error: 'У пользователя больше нет магазинов'
                });
            }
            if (!storeCheck) {
                return res.status(400).json({
                    error: 'Неправильный магазин'
                });
            }
            if (storesCheck.length >= 2) {
                console.log('length > 2');
                const deletedStoreIndex = storesCheck.findIndex(store => store._id.toString() === store_id);
                if (deletedStoreIndex !== -1) {
                    storesCheck.splice(deletedStoreIndex, 1);
                    const newActiveStoreId = storesCheck[storesCheck.length - 1]._id;
                    await Sellers.findOneAndUpdate(
                        {_id: user_id},
                        {active_store: newActiveStoreId}
                    );
                }
            }
            if (storesCheck.length === 1) {
                console.log('length = 1');
                await Sellers.findOneAndUpdate(
                    {_id: user_id},
                    {active_store: storesCheck[0]._id}
                );
            }
            await Stores.findOneAndDelete({
                _id: storeCheck._id
            });
            await Goods.deleteMany({
                store_id: store_id
            })
            const seller = await Sellers.findOne({_id: user_id}).populate({
                path: 'active_store',
                populate: {
                    path: 'city_id'
                }
            });
            return res.status(200).json({
                seller
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    };
}

export default StoresController;


// todo store deny, update good img
