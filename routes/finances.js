import express from 'express';
import FinancesController from '../controllers/FinancesController';
//

const router = express.Router();

router.get('/', FinancesController.GetFinances);
router.get('/stores', FinancesController.GetFinancesAdmin)
router.get('/orders', FinancesController.GetFinanceForStore)
router.get('/admin', FinancesController.GetFinancesAdmin);
export default router;
