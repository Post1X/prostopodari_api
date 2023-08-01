import jwt from 'jsonwebtoken';
//
const EXCLUDE = ['/register/buyer', '/login/buyer', '/register/seller', '/login/seller', '/login/admin']

const authorization = async (req, res, next) => {
    try {
        const {authorization = ''} = req.headers; //  token to variable
        const {originalUrl, method} = req;
        if (method === 'OPTIONS' || EXCLUDE.includes(req.path)) {
            next();
            return;
        }
        if (!authorization) {
            console.log(req.path)
            res.status(400).json({
                error: 'no_token',
                description: 'Непредвиденная ошибка. Свяжитесь с администрацией.'
            })
        }
        const {JWT_SECRET} = process.env;
        const token = authorization.replace('Bearer ', ''); // getting token
        const userInfo = jwt.verify(token, JWT_SECRET); // verifying token
        req.user_id = userInfo.user_id; // getting data from token (user_id)
        if (userInfo.isAdmin) {
            req.isAdmin = userInfo.isAdmin
        }
        if (userInfo.isSeller) {
            req.isSeller = userInfo.isSeller
        }
        next();
    } catch (e) {
        e.status = 401;
        next(e);
    }
}

export default authorization;

