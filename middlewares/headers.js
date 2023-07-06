const ALLOW_ORIGIN = ['http://localhost:3000', 'http://localhost:3001'];

//
export default function headersValidation(req, res, next) {
    try {
        const {origin} = req.headers;
        if (ALLOW_ORIGIN.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader(
                'Access-Control-Allow-Headers',
                'Authorization,Referer,Content-Type'
            );
            res.setHeader(
                'Access-Control-Allow-Methods',
                'GET,POST,PUT,DELETE,PATCH,OPTIONS'
            );
        }

        next();
    } catch (e) {
        e.status = 401;
        next(e);
    }
}
