import express from 'express';
import CategoriesController from '../controllers/CategoriesController';
import upload from '../utilities/multer';

const uploadImage = upload.single('photo')

const router = express.Router();

router.get('/', CategoriesController.GetCategories)
router.post('/', uploadImage, CategoriesController.CreateCategory)
router.put('/', uploadImage, CategoriesController.UpdateCategory)
router.delete('/:id', CategoriesController.DeleteCategory)
export default router;
