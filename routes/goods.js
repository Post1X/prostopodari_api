import express from 'express';
import GoodsController from '../controllers/GoodsController';
import upload from '../utilities/multer';

const uploadFields = upload.any();

const router = express.Router();

router.get('/', GoodsController.GetGoods);
router.post('/', uploadFields, GoodsController.CreateGoods);
router.put('/', GoodsController.UpdateGoods);
router.delete('/:id', GoodsController.DeleteGoods);
export default router;
