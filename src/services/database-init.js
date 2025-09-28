import sequelize from '../config/database.js';
import { User, Product } from '../models/index.js';
import bcrypt from 'bcrypt';

export async function initDatabase({ seedDemo = true } = {}) {
  // Enable alter to evolve schema for new fields (isSuspended, isHidden, activity_logs)
  await sequelize.sync({ alter: true });

  if (seedDemo) {
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const admin = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: passwordHash,
        role: 'admin',
        isVerified: true,
        balance: 10000.00
      });

      await Product.create({
        title: 'Founders Piece #1',
        description: 'A unique 1-of-1 demo product',
        category: 'Art',
        originalPrice: 500.00,
        currentPrice: 500.00,
        status: 'available',
        condition: 'mint',
        images: [],
        ownerId: admin.id,
        originalOwnerId: admin.id
      });
    }
  }
}

export default initDatabase;
