import express from 'express';
import BuyersController from '../controllers/BuyersController';
import AdminController from '../controllers/AdminController';
import SellersController from '../controllers/SellersController';
import PromotionsController from '../controllers/PromotionsController';

import upload from '../utilities/multer';

const uploadFields = upload.any();
const router = express.Router();

// buyers
router.post('/register/buyer/call', BuyersController.ConfirmAndReg);
router.post('/register/buyer/confirm-number', BuyersController.RegBuyer);
router.post('/login/buyer', BuyersController.LoginBuyer);
router.post('/get-city', BuyersController.findCity);
router.put('/get-geo', BuyersController.ChangeGeostatus)
router.get('/profile/buyer', BuyersController.UserProfile);
router.put('/profile/buyer', BuyersController.UpdateProfile);
router.delete('/profile/buyer', BuyersController.DeleteProfile);
// sellers
router.post('/register/seller', uploadFields, SellersController.RegSeller);
router.post('/login/seller', SellersController.LoginSeller);
router.put('/sellers/try', SellersController.DenySecondAttempt);
router.get('/profile/seller', SellersController.SellerProfile);
router.put('/profile/seller', uploadFields, SellersController.UpdateProfile)
router.put('/profile/seller/password', SellersController.UpdatePassword)
router.delete('/profile/seller', SellersController.DeleteProfile);
router.post('/profile/seller/subscription', PromotionsController.getPromotion);
//
router.get('/check-sub', PromotionsController.checkPromotion);
router.post('/stores/active', SellersController.AddStoreToActive);
// admin
router.post('/login/admin', AdminController.AdminLogin);
router.get('/sellers/claims', AdminController.ClaimSellers);
router.put('/sellers/claims', AdminController.ChangeStatus);
router.get('/sellers', AdminController.GetSellers);
router.put('/sellers/ban', AdminController.BanSellers)
router.put('/sellers/approve', AdminController.ApproveSellers);
router.put('/sellers/deny', AdminController.DenySellers);

// router.get('/getcord', BuyersController.GetCords);
// router.get('/deleteall', BuyersController.TerminateAll)


export default router;
