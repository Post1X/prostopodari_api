import express from 'express';
import CategoriesController from '../controllers/CategoriesController';

const router = express.Router();

router.get('/', CategoriesController.GetSubCategories);
router.post('/', CategoriesController.CreateSubCategory);
router.put('/', CategoriesController.UpdateSubCategory);

export default router;
