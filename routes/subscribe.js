import express from 'express';
import PromotionsController from '../controllers/PromotionsController';
//
const router = express.Router();

router.get('/details', PromotionsController.getPromotionInfo);
router.post('/change', PromotionsController.changeSellerStatus);
export default router;
