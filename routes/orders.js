import express from 'express';
import OrdersController from '../controllers/OrdersController';

const router = express.Router();

router.post('/', OrdersController.CreateOrder);
router.get('/user', OrdersController.GetOrdersUser);
router.get('/status', OrdersController.GetStatus);
export default router;
