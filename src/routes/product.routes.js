import { Router } from 'express';
import * as ProductController from '../controllers/product.controller.js';

const router = Router();

router.get('/', ProductController.list);
router.get('/search', ProductController.search);
router.get('/categories', ProductController.categories);
router.get('/user/:userId', ProductController.getByUser);
router.get('/:id', ProductController.get);

export default router;
