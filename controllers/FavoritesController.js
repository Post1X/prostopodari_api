import Favorites from '../schemas/FavoritesSchema';

//
class FavoritesController {
    static AddToFavorites = async (req, res, next) => {
        try {
            const {store_id, good_id} = req.query;
            const {user_id} = req;
            const favGood = await Favorites.findOne({
                user_id: user_id,
                good_id: good_id
            });
            if (favGood) {
                res.status(400).json({
                    error: 'Этот товар уже в списке любимых'
                })
            }
            if (good_id && store_id) {
                const newFavorites = new Favorites({
                    user_id: user_id,
                    good_id: good_id,
                    store_id: store_id
                })
                await newFavorites.save();
            }
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static AddStoreToFavorites = async (req, res, next) => {
        try {
            const {store_id} = req.query;
            const {user_id} = req;
            const favStore = await Favorites.findOne({
                user_id: user_id,
                store_id: store_id
            })
            if (favStore) {
                res.status(400).json({
                    error: 'Этот магазин уже в списке любимых.'
                })
            }
            if (store_id) {
                const newFavorites = new Favorites({
                    user_id: user_id,
                    store_id: store_id
                })
                await newFavorites.save();
            }
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetFavorites = async (req, res, next) => {
        try {
            const {user_id} = req;
            const favorite = await Favorites.find({
                user_id: user_id
            })
                .populate('good_id')
                .populate('store_id')
            res.status(200).json(favorite)
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetFavoriteStores = async (req, res, next) => {
        try {
            const {user_id} = req;
            const favorite = await Favorites.find(
                {user_id: user_id},
                {user_id: 1, store_id: 1, _id: 0}
            )
                .populate('store_id');
            res.status(200).json(favorite);
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }

    //
    static DeleteFavorites = async (req, res, next) => {
        try {
            const {user_id} = req;
            const {good_id} = req.query;
            await Favorites.deleteOne({
                user_id: user_id,
                good_id: good_id
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

export default FavoritesController;
