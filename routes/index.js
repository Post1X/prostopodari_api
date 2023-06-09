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

const router = express.Router();

router.use('/stores', authorization, stores);
router.use('/users', authorization, users);
router.use('/reports', authorization, reports);
router.use('/categories', authorization, categories);
router.use('/sub-categories', authorization, subcategories);
router.use('/promocodes', authorization, promocodes);
router.use('/cities', authorization, cities);
router.use('/goods', authorization, goods);

export default router;
