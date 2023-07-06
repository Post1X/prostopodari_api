import express from 'express';
import PromocodesController from '../controllers/PromocodesController';
//
const router = express.Router();

router.get('/', PromocodesController.GetPromocodes);
router.post('/', PromocodesController.CreatePromocode);
router.put('/', PromocodesController.UpdatePromocode);
router.delete('/:id', PromocodesController.DeletePromocode);
export default router;
