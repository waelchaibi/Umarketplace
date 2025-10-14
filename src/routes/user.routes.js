import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/index.js';
import { Op } from 'sequelize';

const router = Router();

router.use(requireAuth);

router.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const limit = Math.min(Number(req.query.limit || 10), 50);
    if (!q) return res.json({ success: true, data: [] });

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ]
      },
      attributes: ['id', 'username', 'email', 'role', 'isSuspended'],
      limit,
      order: [['username', 'ASC']]
    });
    res.json({ success: true, data: users });
  } catch (e) { next(e); }
});

export default router;


