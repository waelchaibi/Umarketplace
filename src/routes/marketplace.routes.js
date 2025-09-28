import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as MarketplaceController from '../controllers/marketplace.controller.js';

const router = Router();

router.use(requireAuth);
router.post('/buy/:productId', MarketplaceController.buy);
router.post('/sell', MarketplaceController.sell);
router.put('/price/:productId', MarketplaceController.updatePrice);

export default router;
