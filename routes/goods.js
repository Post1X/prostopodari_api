import express from 'express';
import GoodsController from '../controllers/GoodsController';
import upload from '../utilities/multer';
//
const uploadFields = upload.any();

const router = express.Router();

router.get('/', GoodsController.GetGoods);
router.get('/single', GoodsController.GetOneGood);
router.get('/filter', GoodsController.FilterGoods);
router.delete('/photo', GoodsController.DeletePhotos);
router.get('/all', GoodsController.GetAllGoods);
router.put('/promote/:good_id', GoodsController.PromoteGoods);
router.post('/', uploadFields, GoodsController.CreateGoods);
router.put('/', uploadFields, GoodsController.UpdateGoods);
router.delete('/:id', GoodsController.DeleteGoods);
export default router;
