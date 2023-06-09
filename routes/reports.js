import express from 'express';
import AdminController from '../controllers/AdminController';

const router = express.Router();

router.get('/', AdminController.GetReports)
export default router;
