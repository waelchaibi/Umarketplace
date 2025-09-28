import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as MessageController from '../controllers/message.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/conversations', MessageController.conversations);
router.get('/conversation/:userId', MessageController.withUser);
router.post('/send', MessageController.send);
router.put('/:id/read', MessageController.markRead);

export default router;
