import express from 'express';
import FinancesController from '../controllers/FinancesController';
//

const router = express.Router();

router.get('/', FinancesController.GetFinances);
router.get('/admin', FinancesController.GetFinancesAdmin);
export default router;
