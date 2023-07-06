import jwt from 'jsonwebtoken';
import Sellers from '../schemas/SellersSchema';
import Stores from '../schemas/StoresSchema';
//
const EXCLUDE = ['/register/buyer', '/login/buyer', '/register/seller', '/login/seller', '/login/admin'];

const addactivestore = async (req, res, next) => {
    try {
        const { authorization = '' } = req.headers;
        const { originalUrl, method } = req;
        if (method === 'OPTIONS' || EXCLUDE.includes(req.path)) {
            next();
            return;
        }
        if (!authorization) {
            console.log(req.path);
            next(); // Добавлено возвращение из функции, чтобы не продолжать выполнение кода
            return;
        }
        const { JWT_SECRET } = process.env;
        const token = authorization.replace('Bearer ', '');
        const userInfo = jwt.verify(token, JWT_SECRET);
        const user_id = userInfo.user_id;
        const seller = await Sellers.findOne({
            _id: user_id
        });
        //
        const stores = await Stores.find({
            seller_user_id: user_id
        });
        //
        console.log(stores, 'store1');
        if (stores.length !== 0) {
            console.log(stores[0]._id, 'store');
            console.log(stores.length, 'storelength');
            console.log(seller._id, 'seller');
            if (!seller.active_store) {
                console.log('active%null check');
                await Sellers.findByIdAndUpdate(
                    {
                        _id: user_id
                    },
                    {
                        active_store: stores[0]._id
                    }
                );
            }
            next();
            return;
        }
        next();
    } catch (e) {
        console.error(e);
        e.status = 401;
        next(e);
    }
};

export default addactivestore;
