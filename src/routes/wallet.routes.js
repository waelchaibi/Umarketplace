import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as WalletController from '../controllers/wallet.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/balance', WalletController.balance);
router.post('/add-funds', WalletController.addFunds);
router.get('/transactions', WalletController.transactions);

export default router;
