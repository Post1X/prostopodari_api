import express from 'express';
import upload from '../utilities/multer';
import StoresController from '../controllers/StoresController'
//
const uploadFields = upload.any();

const router = express.Router();

router.get('/my', StoresController.GetStore);
router.get('/reviews', StoresController.GetReviews);
router.post('/reviews', StoresController.CreateReview);
router.put('/reviews', StoresController.EditReview);
router.delete('/reviews', StoresController.DeleteReview);
router.post('/my', uploadFields, StoresController.CreateStore);
router.put('/my', uploadFields, StoresController.UpdateStore);
router.delete('/my', StoresController.DeleteStore);
router.get('/', StoresController.DeleteStore);
export default router;
