import sequelize from '../config/database.js';
import { User, Product, Challenge, ChallengeAnswer } from '../models/index.js';
import bcrypt from 'bcrypt';

export async function initDatabase({ seedDemo = true } = {}) {
  // Pre-sync repair: if users table exists with too many/dangling indexes, drop non-primary indexes
  try {
    const [exists] = await sequelize.query("SHOW TABLES LIKE 'users'");
    if (Array.isArray(exists) && exists.length > 0) {
      const [idxRows] = await sequelize.query('SHOW INDEX FROM `users`');
      const rows = Array.isArray(idxRows) ? idxRows : [];
      for (const idx of rows) {
        const keyName = String(idx.Key_name || '');
        if (keyName && keyName !== 'PRIMARY') {
          await sequelize.query(`ALTER TABLE \`users\` DROP INDEX \`${keyName}\``);
        }
      }
    }
  } catch (e) {
    console.error('[DB Init] Users pre-sync index cleanup error:', e?.message || e);
  }

  // Enable alter to evolve schema for new fields (isSuspended, isHidden, activity_logs, défis)
  await sequelize.sync({ alter: true });

  // Ensure new Défis columns exist even if sync alter didn't catch them (cross-machine DBs)
  try {
    // Challenges table columns
    const [typeCol] = await sequelize.query("SHOW COLUMNS FROM `challenges` LIKE 'type'");
    if (!Array.isArray(typeCol) || typeCol.length === 0) {
      await sequelize.query(`
        ALTER TABLE \`challenges\`
        ADD COLUMN \`type\` ENUM('text','qcm') NOT NULL DEFAULT 'text' AFTER \`id\`,
        ADD COLUMN \`options\` JSON NULL AFTER \`question\`,
        ADD COLUMN \`correctOptionIndex\` INT UNSIGNED NULL AFTER \`options\`,
        ADD COLUMN \`imageUrl\` VARCHAR(255) NULL AFTER \`correctAnswer\`
      `);
    }
    // Challenge answers column for QCM
    const [selIdxCol] = await sequelize.query("SHOW COLUMNS FROM `challenge_answers` LIKE 'selectedOptionIndex'");
    if (!Array.isArray(selIdxCol) || selIdxCol.length === 0) {
      await sequelize.query(`
        ALTER TABLE \`challenge_answers\`
        ADD COLUMN \`selectedOptionIndex\` INT UNSIGNED NULL AFTER \`userId\`
      `);
    }
  } catch (e) {
    // Non-fatal; log and continue
    // eslint-disable-next-line no-console
    console.error('[DB Init] Defis schema ensure error:', e?.message || e);
  }

  // Repair users unique indexes to avoid ER_TOO_MANY_KEYS caused by repeated ALTER .. UNIQUE
  try {
    const [idxRows] = await sequelize.query('SHOW INDEX FROM `users`');
    const uniqueEmailIdx = (Array.isArray(idxRows) ? idxRows : []).filter(r => String(r.Column_name).toLowerCase() === 'email' && Number(r.Non_unique) === 0);
    const uniqueUserIdx = (Array.isArray(idxRows) ? idxRows : []).filter(r => String(r.Column_name).toLowerCase() === 'username' && Number(r.Non_unique) === 0);
    // Drop all existing unique indexes for email except the desired one
    for (const idx of uniqueEmailIdx) {
      if (idx.Key_name !== 'ux_users_email') {
        await sequelize.query(`ALTER TABLE \`users\` DROP INDEX \`${idx.Key_name}\``);
      }
    }
    for (const idx of uniqueUserIdx) {
      if (idx.Key_name !== 'ux_users_username') {
        await sequelize.query(`ALTER TABLE \`users\` DROP INDEX \`${idx.Key_name}\``);
      }
    }
    // Create named unique indexes if missing
    const hasEmail = (await sequelize.query("SHOW INDEX FROM `users` WHERE Key_name = 'ux_users_email'"))[0];
    if (!Array.isArray(hasEmail) || hasEmail.length === 0) {
      await sequelize.query('ALTER TABLE `users` ADD UNIQUE INDEX `ux_users_email` (`email`)');
    }
    const hasUsername = (await sequelize.query("SHOW INDEX FROM `users` WHERE Key_name = 'ux_users_username'"))[0];
    if (!Array.isArray(hasUsername) || hasUsername.length === 0) {
      await sequelize.query('ALTER TABLE `users` ADD UNIQUE INDEX `ux_users_username` (`username`)');
    }
  } catch (e) {
    console.error('[DB Init] Users unique index repair error:', e?.message || e);
  }

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
