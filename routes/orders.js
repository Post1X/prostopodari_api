import express from 'express';
import OrdersController from '../controllers/OrdersController';
import PaymentsController from '../controllers/PaymentsController';
//
const router = express.Router();

router.post('/', OrdersController.CreateOrder);
router.post('/test', PaymentsController.Test);
router.get('/seller', OrdersController.GetOrderSeller);
router.get('/buyer', OrdersController.GetOrdersUser);
router.post('/update-status', OrdersController.ChangeStatus);
router.get('/status', OrdersController.GetStatus);
router.get('/single', OrdersController.GetOrder);
router.post('/status', OrdersController.CreateStatus);
export default router;

