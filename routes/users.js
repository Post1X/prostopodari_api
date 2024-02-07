import express from 'express';
import BuyersController from '../controllers/BuyersController';
import AdminController from '../controllers/AdminController';
import SellersController from '../controllers/SellersController';
import PromotionsController from '../controllers/PromotionsController';

import upload from '../utilities/multer';
import FcmController from '../controllers/FcmController';

const uploadFields = upload.any();
const router = express.Router();

// buyers
router.post('/register/buyer/call', BuyersController.ConfirmAndReg);
router.post('/register/buyer/confirm-number', BuyersController.RegBuyer);
router.post('/login/buyer', BuyersController.LoginBuyer);
router.post('/get-city', BuyersController.findCity);
router.put('/get-geo', BuyersController.ChangeGeostatus);
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
router.post('/fcm', FcmController.generateTokenForUser);
//
router.get('/check-sub', PromotionsController.checkPromotion);
router.post('/stores/active', SellersController.AddStoreToActive);
// admin
router.post('/login/admin', AdminController.AdminLogin);
router.post('/admin/message/sellers', FcmController.sendMessage);
router.post('/admin/message/buyers', FcmController.sendMessageBuyer);
router.get('/admin/notifications', FcmController.getNotifications);
router.get('/sellers/claims', AdminController.ClaimSellers);
router.put('/sellers/claims', AdminController.ChangeStatus);
router.get('/sellers', AdminController.GetSellers);
router.put('/sellers/ban', AdminController.BanSellers)
router.put('/sellers/approve', AdminController.ApproveSellers);
router.put('/sellers/deny', AdminController.DenySellers);
router.post('/admin/upload-image', uploadFields, AdminController.uploadImage);
router.post('/admin/banner', uploadFields, AdminController.uploadBanner);
router.get('/admin/banner', AdminController.getBanner)
router.delete('/admin/banner', AdminController.deleteBanner);

export default router;
