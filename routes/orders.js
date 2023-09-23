import express from 'express';
import OrdersController from '../controllers/OrdersController';
import PaymentsController from '../controllers/PaymentsController';
//
const router = express.Router();

router.post('/', OrdersController.CreateOrder);
router.post('/payment', PaymentsController.Test);
router.get('/seller', OrdersController.GetOrderSeller);
router.get('/buyer', OrdersController.GetOrdersUser);
router.post('/update-status', OrdersController.ChangeStatus);
router.get('/status', OrdersController.GetStatus);
router.get('/single', OrdersController.GetOrder);
router.post('/status', OrdersController.CreateStatus);
router.get('/sas', PaymentsController.testModule);
export default router;

