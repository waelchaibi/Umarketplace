import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as BidController from '../controllers/bid.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/me', BidController.listMine);

export default router;


