import express from 'express';
import CartsController from '../controllers/CartsController';
//

const router = express.Router();

router.post('/', CartsController.CreateCartItem);
router.get('/', CartsController.GetCartItems);
router.post('/add', CartsController.AddToCart);
router.delete('/delete', CartsController.DeleteCartItem);
export default router;
