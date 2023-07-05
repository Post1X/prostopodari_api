import jwt from 'jsonwebtoken';
import Sellers from '../schemas/SellersSchema';
import Stores from '../schemas/StoresSchema';

const addactivestore = async (req, res, next) => {
    try {
        const {authorization = ''} = req.headers;
        const {originalUrl, method} = req;
        if (method === 'OPTIONS' || EXCLUDE.includes(req.path)) {
            next();
            return;
        }
        if (!authorization) {
            console.log(req.path)
            res.status(400).json({
                error: 'Непредвиденная ошибка. (JWT malformed/JWT unreachable).'
            })
        }
        const {JWT_SECRET} = process.env;
        const token = authorization.replace('Bearer ', '');
        const userInfo = jwt.verify(token, JWT_SECRET);
        req.user_id = userInfo.user_id;
        const seller = await Sellers.findOne({
            _id: user_id
        })
        //
        const store = await Stores.find({
            seller_user_id: seller._id
        })
        //
        if (store.length !== 0) {
            if (!seller.active_store && seller.active_store === null) {
                await Sellers.findByIdAndUpdate({
                    _id: seller._id
                }, {
                    active_store: store[0]._id
                })
            }
        }
        next();
    } catch (e) {
        e.status = 401;
        next(e);
    }
}

export default addactivestore;
