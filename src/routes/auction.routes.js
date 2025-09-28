import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as AuctionController from '../controllers/auction.controller.js';

const router = Router();

router.post('/create', requireAuth, AuctionController.create);
router.get('/', AuctionController.list);
router.get('/:id', AuctionController.get);
router.post('/:id/bid', requireAuth, AuctionController.bid);
router.post('/:id/cancel', requireAuth, AuctionController.cancel);

export default router;
