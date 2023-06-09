import Goods from '../schemas/GoodsSchema';

class GoodsController {
    static CreateGoods = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const photoArray = [];
            const {
                category_id,
                subcategory_id,
                title,
                count,
                time_to_get_ready,
                store_id,
                short_description,
                price,
                parameters
            } = req.body;
            //
            req.files.forEach((file, index) => {
                if (file.fieldname === `photo_${index}`) {
                    const filePath = `${file.destination}${file.filename}`;
                    photoArray.push(filePath);
                }
            });
            //
            const newGoods = new Goods({
                category_id: category_id,
                subcategory_id: subcategory_id,
                title: title,
                count: count,
                time_to_get_ready: time_to_get_ready,
                store_id: store_id,
                photo_list: photoArray,
                short_description: short_description,
                price: price,
                parameters: parameters
            });
            await newGoods.save();
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static GetGoods = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const {store_id} = req.query;
            const goods = await Goods.find({store_id: store_id})
                .populate('category_id')
                .exec()
            res.status(200).json({
                goods
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static UpdateGoods = async (req, res, next) => {
        try {
            if (!req.isSeller || req.isSeller !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const {
                id,
                category_id,
                subcategory_id,
                title,
                count,
                time_to_get_ready,
                store_id,
                short_description,
                price,
                parameters
            } = req.body;
            //
            console.log(id)
            await Goods.findByIdAndUpdate({
                _id: id
            }, {
                category_id: category_id,
                subcategory_id: subcategory_id,
                title: title,
                count: count,
                time_to_get_ready: time_to_get_ready,
                store_id: store_id,
                short_description: short_description,
                price: price,
                parameters: parameters
            })
            res.status(200).json({
                message: 'success'
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static DeleteGoods = async (req, res, next) => {
        try {
            const {id} = req.params;
            await Goods.findByIdAndDelete({
                _id: id
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

export default GoodsController;
