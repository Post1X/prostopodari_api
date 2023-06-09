import Cities from '../schemas/CitiesSchema';

class CitiesController {
    static GetCities = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const cities = await Cities.find();
            res.status(200).json({
                cities
            })
        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
    //
    static MakeCityActive = async (req, res, next) => {
        try {
            if (!req.isAdmin || req.isAdmin !== true) {
                res.status(400).json({
                    error: 'not_enough_rights',
                    description: 'У вас нет права находиться на данной странице.'
                })
            }
            const {id_list} = req.body;

        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

export default CitiesController;
