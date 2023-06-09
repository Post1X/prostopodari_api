import express from 'express';
import PromocodesController from '../controllers/PromocodesController';

const router = express.Router();

router.get('/', PromocodesController.GetPromocodes);
export default router;
