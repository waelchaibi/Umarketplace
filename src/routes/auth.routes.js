import { Router } from 'express';
import { body } from 'express-validator';
import { authLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';
import * as AuthController from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', authLimiter, [
  body('email').isEmail(),
  body('username').isLength({ min: 3, max: 50 }),
  body('password').isStrongPassword({ minLength: 8, minSymbols: 0 })
], AuthController.register);

router.post('/login', authLimiter, [
  body('email').isEmail(),
  body('password').isString().isLength({ min: 8 })
], AuthController.login);

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out (client should discard token)' });
});

router.get('/profile', requireAuth, AuthController.profile);
router.put('/profile', requireAuth, AuthController.updateProfile);
router.post('/verify-email', requireAuth, AuthController.verifyEmail);

export default router;
