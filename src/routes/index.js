import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import productRoutes from './product.routes.js';
import marketplaceRoutes from './marketplace.routes.js';
import auctionRoutes from './auction.routes.js';
import tradeRoutes from './trade.routes.js';
import messageRoutes from './message.routes.js';
import walletRoutes from './wallet.routes.js';
import defisRoutes from './defis.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/products', productRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/auctions', auctionRoutes);
router.use('/trades', tradeRoutes);
router.use('/messages', messageRoutes);
router.use('/wallet', walletRoutes);
router.use('/defis', defisRoutes);

export default router;
