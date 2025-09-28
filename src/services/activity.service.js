import { ActivityLog, User, Product, Auction, Transaction } from '../models/index.js';
import { Op } from 'sequelize';

export async function log({ actorUserId, action, targetType, targetId, metadata }) {
  return ActivityLog.create({ actorUserId: actorUserId || null, action, targetType, targetId, metadata });
}

export async function recent({ limit = 50 }) {
  return ActivityLog.findAll({ order: [['createdAt', 'DESC']], limit });
}

export async function stats() {
  const users = await User.count();
  const products = await Product.count({ where: { isHidden: false } });
  const activeAuctions = await Auction.count({ where: { status: 'active' } });
  const sales30d = await Transaction.count({ where: { createdAt: { [Op.gte]: new Date(Date.now() - 30*24*60*60*1000) }, status: 'completed' } });
  return { users, products, activeAuctions, sales30d };
}

export default { log, recent, stats };

