import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as TradeController from '../controllers/trade.controller.js';

const router = Router();

router.use(requireAuth);
router.post('/offer', TradeController.offer);
router.get('/received', TradeController.received);
router.get('/sent', TradeController.sent);
router.put('/:id/accept', TradeController.accept);
router.put('/:id/decline', TradeController.decline);
router.delete('/:id', TradeController.cancel);

export default router;
