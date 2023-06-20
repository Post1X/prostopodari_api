import express from 'express';
import upload from '../utilities/multer';
import StoresController from '../controllers/StoresController'

const uploadFields = upload.any();

const router = express.Router();

router.get('/my', StoresController.GetStore);
router.post('/my', uploadFields, StoresController.CreateStore);
router.put('/my', StoresController.UpdateStore);
export default router;
