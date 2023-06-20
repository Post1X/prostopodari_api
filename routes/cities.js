import express from 'express';
import CitiesController from '../controllers/CitiesController';

const router = express.Router();

router.get('/active', CitiesController.GetCities)
router.get('/', CitiesController.GetCity);
router.post('/active', CitiesController.AddCityToActive);
export default router;
