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
import chat from './chat';
// a

const router = express.Router();

router.use('/stores', authorization, stores);
router.use('/users', authorization, users);
router.use('/carts', authorization, carts);
router.use('/reports', authorization, reports);
router.use('/categories', authorization, categories);
router.use('/sub-categories', authorization, subcategories);
router.use('/promocodes', authorization, promocodes);
router.use('/cities', authorization, cities);
router.use('/goods', authorization, goods);
router.use('/orders', authorization, orders);
router.use('/chat', authorization, chat);
router.use('/favorites', authorization, favorites);
router.use('/finances', authorization, finances)
export default router;
