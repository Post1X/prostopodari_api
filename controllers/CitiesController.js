import Cities from '../schemas/CitiesSchema';
import mongoose from 'mongoose';

class CitiesController {
    static GetCities = async (req, res, next) => {
        try {
            const cities = await Cities.find({
                is_active: true
            }).limit(10);
            res.status(200).json({
                cities
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    };
    //
    static GetCity = async (req, res, next) => {
        try {
            if (!(req.isSeller === true || req.isAdmin === true)) {
                return res.status(400).json({
                    error: 'У вас нет права находиться на данной странице.'
                });
            }
            const {city_name} = req.query;
            //
            const cities = await Cities.find({
                city_name: city_name
            }).limit(20)
            //
            res.status(200).json({
                cities
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static AddCityToActive = async (req, res, next) => {
        try {
            const {id_list} = req.body;
            const isValidIdList = id_list.every(id => mongoose.isValidObjectId(id));
            if (!isValidIdList) {
                res.status(400).json({
                    error: 'Недопустимый идентификатор в списке.'
                })
            }

            const cities = await Cities.find({_id: {$in: id_list}});
            cities.forEach(city => {
                city.is_active = true;
            });
            await Cities.updateMany({_id: {$nin: id_list}}, {$set: {is_active: false}});
            await Promise.all(cities.map(city => city.save()));
            res.status(200).json({
                message: 'success.'
            });
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default CitiesController;
