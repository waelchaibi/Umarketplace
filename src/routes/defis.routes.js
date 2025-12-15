import { Router } from 'express';
import * as DefiController from '../controllers/defi.controller.js';

const router = Router();

// Public routes (client - no auth)
router.get('/active', DefiController.getActive);
router.get('/:id', DefiController.getChallenge);
router.post('/:id/answer', DefiController.postAnswer);

export default router;


