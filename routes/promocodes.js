import express from 'express';
import PromocodesController from '../controllers/PromocodesController';
//
const router = express.Router();

router.get('/', PromocodesController.GetPromocodes);
router.post('/admin', PromocodesController.CreatePromocodeAdmin)
router.post('/', PromocodesController.CreatePromocode);
router.put('/', PromocodesController.UpdatePromocode);
router.delete('/', PromocodesController.DeletePromocode);
router.post('/check', PromocodesController.checkPromocode);
export default router;
