import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import * as AdminController from '../controllers/admin.controller.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['admin']));

router.post('/products', upload.array('images', 6), AdminController.createProduct);
router.put('/products/:id', upload.array('images', 6), AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);
router.put('/products/:id/hide', AdminController.hideProduct);
router.put('/products/:id/unhide', AdminController.unhideProduct);
router.get('/products', AdminController.listProducts);

router.get('/users', AdminController.listUsers);
router.put('/users/:id/role', AdminController.changeUserRole);
router.put('/users/:id/suspend', AdminController.toggleUserSuspension);
router.get('/stats', AdminController.adminStats);
router.get('/logs', AdminController.adminLogs);

export default router;
