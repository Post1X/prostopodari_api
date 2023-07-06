import express from 'express';
import OrdersController from '../controllers/OrdersController';
//
const router = express.Router();

router.post('/', OrdersController.CreateOrder);
router.get('/seller', OrdersController.GetOrderSeller);
router.get('/user', OrdersController.GetOrdersUser);
router.post('/update-status', OrdersController.ChangeStatus);
router.get('/status', OrdersController.GetStatus);
router.post('/status', OrdersController.CreateStatus);
export default router;
