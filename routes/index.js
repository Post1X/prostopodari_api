import express from 'express';
import authorization from '../middlewares/authorization';
import stores from './stores';
import users from './users';
import reports from './reports';
import categories from './categories';
import promocodes from './promocodes';
import cities from './cities';
import subcategories from './subcategories';
import goods from './goods';
import orders from './orders';
import favorites from './favorites';
import finances from './finances';
import carts from './carts';
import subscribe from './subscribe';
import chat from './chat';
import sub from '../middlewares/sub';
// a

const router = express.Router();

router.use('/stores', authorization, sub, stores);
router.use('/users', authorization, sub, users);
router.use('/carts', authorization, sub, carts);
router.use('/reports', authorization, sub, reports);
router.use('/categories', authorization, sub, categories);
router.use('/sub-categories', authorization, sub, subcategories);
router.use('/promocodes', authorization, sub, promocodes);
router.use('/cities', authorization, sub, cities);
router.use('/goods', authorization, sub, goods);
router.use('/orders', authorization, sub, orders);
router.use('/chat', authorization, sub, chat);
router.use('/favorites', authorization, sub, favorites);
router.use('/finances', authorization, sub, finances)
router.use('/subscribe', authorization, sub, subscribe)
export default router;
