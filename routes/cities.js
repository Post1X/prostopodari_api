import express from 'express';
import CitiesController from '../controllers/CitiesController';

const router = express.Router();

router.get('/', CitiesController.GetCities);
export default router;
