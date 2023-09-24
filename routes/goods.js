import express from 'express';
import GoodsController from '../controllers/GoodsController';
import PromotionsController from '../controllers/PromotionsController';
import upload from '../utilities/multer';
//
const uploadFields = upload.any();

const router = express.Router();

router.get('/', GoodsController.GetGoods);
router.get('/single', GoodsController.GetOneGood);
router.get('/filter', GoodsController.FilterGoods);
router.delete('/photo', GoodsController.DeletePhotos);
router.get('/all', GoodsController.GetAllGoods);
router.post('/search', GoodsController.searchGoods)
router.put('/promote', PromotionsController.setPromotion);
router.put('/unpromote', PromotionsController.unsetPromotion);
router.get('/banner', GoodsController.getBanner)
router.post('/', uploadFields, GoodsController.CreateGoods);
router.put('/', uploadFields, GoodsController.UpdateGoods);
router.delete('/:id', GoodsController.DeleteGoods);
export default router;
