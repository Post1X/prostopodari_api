import express from 'express';
import FavoritesController from '../controllers/FavoritesController';

const router = express.Router();

router.get('/', FavoritesController.GetFavorites);
router.post('/', FavoritesController.AddToFavorites);
router.delete('/', FavoritesController.DeleteFavorites);
export default router;
