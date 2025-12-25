import { sequelize, ActivityLog, User, Product, Auction, Transaction } from '../models/index.js';
import { Op, QueryTypes } from 'sequelize';

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

  // Enriched analytics for admin dashboards (charts + KPIs)
  // Commission rule: 10% of all completed transactions
  const DAYS = 30;
  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);

  const revenueDailyRows = await sequelize.query(
    `
      SELECT
        DATE_FORMAT(t.createdAt, '%Y-%m-%d') AS day,
        COALESCE(SUM(t.amount), 0) AS gmv
      FROM transactions t
      WHERE t.status = 'completed' AND t.createdAt >= :since
      GROUP BY day
      ORDER BY day ASC
    `,
    { replacements: { since }, type: QueryTypes.SELECT }
  );

  const newUsersDailyRows = await sequelize.query(
    `
      SELECT
        DATE_FORMAT(u.createdAt, '%Y-%m-%d') AS day,
        COUNT(u.id) AS total
      FROM users u
      WHERE u.createdAt >= :since
      GROUP BY day
      ORDER BY day ASC
    `,
    { replacements: { since }, type: QueryTypes.SELECT }
  );

  const auctionsStartedRows = await sequelize.query(
    `
      SELECT
        DATE_FORMAT(a.startTime, '%Y-%m-%d') AS day,
        COUNT(a.id) AS started
      FROM auctions a
      WHERE a.startTime >= :since
      GROUP BY day
      ORDER BY day ASC
    `,
    { replacements: { since }, type: QueryTypes.SELECT }
  );

  const auctionsEndedRows = await sequelize.query(
    `
      SELECT
        DATE_FORMAT(a.endTime, '%Y-%m-%d') AS day,
        COUNT(a.id) AS ended
      FROM auctions a
      WHERE a.status = 'ended' AND a.endTime >= :since
      GROUP BY day
      ORDER BY day ASC
    `,
    { replacements: { since }, type: QueryTypes.SELECT }
  );

  const productsByCategoryRows = await sequelize.query(
    `
      SELECT
        COALESCE(NULLIF(TRIM(p.category), ''), 'Autre') AS category,
        COUNT(p.id) AS total
      FROM products p
      WHERE p.isHidden = 0
      GROUP BY category
      ORDER BY total DESC
      LIMIT 8
    `,
    { type: QueryTypes.SELECT }
  );

  const topBuyersRows = await sequelize.query(
    `
      SELECT
        u.id AS userId,
        u.username AS username,
        COALESCE(SUM(t.amount), 0) AS totalSpent
      FROM transactions t
      JOIN users u ON u.id = t.fromUserId
      WHERE t.status = 'completed' AND t.createdAt >= :since
      GROUP BY u.id, u.username
      ORDER BY totalSpent DESC
      LIMIT 5
    `,
    { replacements: { since }, type: QueryTypes.SELECT }
  );

  const totals30dRows = await sequelize.query(
    `
      SELECT
        COALESCE(SUM(t.amount), 0) AS gmv30d,
        COUNT(t.id) AS transactions30d
      FROM transactions t
      WHERE t.status = 'completed' AND t.createdAt >= :since
    `,
    { replacements: { since }, type: QueryTypes.SELECT }
  );

  const prevSince = new Date(Date.now() - 2 * DAYS * 24 * 60 * 60 * 1000);
  const prevWindowRows = await sequelize.query(
    `
      SELECT
        COALESCE(SUM(t.amount), 0) AS gmvPrev30d
      FROM transactions t
      WHERE t.status = 'completed'
        AND t.createdAt >= :prevSince
        AND t.createdAt < :since
    `,
    { replacements: { prevSince, since }, type: QueryTypes.SELECT }
  );

  const gmv30d = Number(totals30dRows?.[0]?.gmv30d || 0);
  const transactions30d = Number(totals30dRows?.[0]?.transactions30d || 0);
  const commissionRate = 0.10;
  const commission30d = gmv30d * commissionRate;
  const avgOrderValue30d = transactions30d > 0 ? gmv30d / transactions30d : 0;

  const gmvPrev30d = Number(prevWindowRows?.[0]?.gmvPrev30d || 0);
  const commissionPrev30d = gmvPrev30d * commissionRate;
  const commissionChangePct =
    commissionPrev30d > 0
      ? ((commission30d - commissionPrev30d) / commissionPrev30d) * 100
      : commission30d > 0
        ? 100
        : 0;

  const revMap = new Map((revenueDailyRows || []).map((r) => [r.day, Number(r.gmv || 0)]));
  const newUsersMap = new Map((newUsersDailyRows || []).map((r) => [r.day, Number(r.total || 0)]));
  const startedMap = new Map((auctionsStartedRows || []).map((r) => [r.day, Number(r.started || 0)]));
  const endedMap = new Map((auctionsEndedRows || []).map((r) => [r.day, Number(r.ended || 0)]));

  const allDays = Array.from(
    new Set([
      ...Array.from(revMap.keys()),
      ...Array.from(newUsersMap.keys()),
      ...Array.from(startedMap.keys()),
      ...Array.from(endedMap.keys()),
    ])
  ).sort();

  const revenueDaily = allDays.map((day) => {
    const gmv = Number(revMap.get(day) || 0);
    return {
      day,
      gmv,
      commission: Number((gmv * commissionRate).toFixed(2)),
    };
  });

  const newUsersDaily = allDays.map((day) => ({
    day,
    total: Number(newUsersMap.get(day) || 0),
  }));

  const auctionsDaily = allDays.map((day) => ({
    day,
    started: Number(startedMap.get(day) || 0),
    ended: Number(endedMap.get(day) || 0),
  }));

  const productsByCategory = (productsByCategoryRows || []).map((r) => ({
    category: r.category,
    total: Number(r.total || 0),
  }));

  const topBuyers = (topBuyersRows || []).map((r) => ({
    userId: Number(r.userId),
    username: r.username,
    totalSpent: Number(r.totalSpent || 0),
  }));

  return {
    users,
    products,
    activeAuctions,
    sales30d,
    kpis: {
      gmv30d,
      commission30d: Number(commission30d.toFixed(2)),
      transactions30d,
      avgOrderValue30d: Number(avgOrderValue30d.toFixed(2)),
      commissionChangePct: Number(commissionChangePct.toFixed(2)),
      commissionRate,
    },
    charts: {
      revenueDaily,
      newUsersDaily,
      auctionsDaily,
      productsByCategory,
      topBuyers,
    },
  };
}

export default { log, recent, stats };

