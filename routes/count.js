import express from 'express';
import CountsController from '../controllers/CountsController';
//

const router = express.Router();

router.get('/', CountsController.getMessagesBuyer);
export default router;
