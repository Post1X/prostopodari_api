import express from 'express';
import BuyersController from '../controllers/BuyersController';
import AdminController from '../controllers/AdminController';
import SellersController from '../controllers/SellersController';
import addactivestore from '../middlewares/addactivestore';
import upload from '../utilities/multer';

const uploadFields = upload.any();
const router = express.Router();

router.post('/register/buyer', BuyersController.RegBuyer);
router.post('/login/buyer', BuyersController.LoginBuyer);
router.get('/profile/buyer', BuyersController.UserProfile);
router.put('/profile/buyer', BuyersController.UpdateProfile);
router.delete('/profile/buyer', BuyersController.DeleteProfile);
//
router.post('/register/seller', uploadFields, SellersController.RegSeller);
router.post('/login/seller',  SellersController.LoginSeller);
router.get('/profile/seller', addactivestore, SellersController.SellerProfile);
router.put('/profile/seller', uploadFields, SellersController.UpdateProfile)
router.put('/profile/seller/password', SellersController.UpdatePassword)
router.delete('/profile/seller', SellersController.DeleteProfile);
router.post('/profile/seller/subscription', SellersController.GetSub);
router.post('/stores/active', SellersController.AddStoreToActive);
//
router.post('/login/admin', AdminController.AdminLogin);
router.get('/sellers/pending', AdminController.GetPendingSellers);
router.put('/sellers/approve', AdminController.ApproveSellers);
router.put('/sellers/deny', AdminController.DenySellers);




// router.get('/deleteall', BuyersController.TerminateAll)


export default router;
