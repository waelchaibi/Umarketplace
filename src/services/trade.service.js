import { sequelize, TradeOffer, Product, Transaction, User } from '../models/index.js';
import { getIo } from '../config/socket.js';

export async function offer({ fromUserId, toUserId, offeredProductId, requestedProductId, additionalAmount = 0, message }) {
  // Ensure ownership
  const offered = await Product.findByPk(offeredProductId);
  const requested = await Product.findByPk(requestedProductId);
  if (!offered || !requested) throw Object.assign(new Error('Product not found'), { status: 404 });
  if (offered.ownerId !== fromUserId) throw Object.assign(new Error('You do not own offered product'), { status: 403 });

  const offer = await TradeOffer.create({ fromUserId, toUserId, offeredProductId, requestedProductId, additionalAmount, message, status: 'pending' });
  getIo().to(`user:${toUserId}`).emit('trade:offer_received', { offerId: offer.id, fromUserId });
  return offer;
}

export async function listReceived(userId) { return await TradeOffer.findAll({ where: { toUserId: userId }, order: [['createdAt', 'DESC']] }); }
export async function listSent(userId) { return await TradeOffer.findAll({ where: { fromUserId: userId }, order: [['createdAt', 'DESC']] }); }

export async function accept({ offerId, userId }) {
  return await sequelize.transaction(async (t) => {
    const offer = await TradeOffer.findByPk(offerId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!offer) throw Object.assign(new Error('Offer not found'), { status: 404 });
    if (offer.toUserId !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });
    if (offer.status !== 'pending') throw Object.assign(new Error('Offer not pending'), { status: 400 });

    const offered = await Product.findByPk(offer.offeredProductId, { transaction: t, lock: t.LOCK.UPDATE });
    const requested = await Product.findByPk(offer.requestedProductId, { transaction: t, lock: t.LOCK.UPDATE });

    if (offered.ownerId !== offer.fromUserId) throw Object.assign(new Error('Offered product no longer owned by sender'), { status: 400 });
    if (requested.ownerId !== offer.toUserId) throw Object.assign(new Error('Requested product no longer owned by receiver'), { status: 400 });

    // Handle additional amount from fromUser to toUser
    if (Number(offer.additionalAmount) > 0) {
      const fromUser = await User.findByPk(offer.fromUserId, { transaction: t, lock: t.LOCK.UPDATE });
      const toUser = await User.findByPk(offer.toUserId, { transaction: t, lock: t.LOCK.UPDATE });
      if (Number(fromUser.balance) < Number(offer.additionalAmount)) throw Object.assign(new Error('Insufficient balance for additional amount'), { status: 400 });
      fromUser.balance = Number(fromUser.balance) - Number(offer.additionalAmount);
      toUser.balance = Number(toUser.balance) + Number(offer.additionalAmount);
      await fromUser.save({ transaction: t });
      await toUser.save({ transaction: t });
      await Transaction.create({ fromUserId: fromUser.id, toUserId: toUser.id, productId: requested.id, type: 'trade', amount: Number(offer.additionalAmount), status: 'completed' }, { transaction: t });
    }

    // Swap ownership
    const tempOwner = offered.ownerId;
    offered.ownerId = requested.ownerId;
    requested.ownerId = tempOwner;
    offered.status = 'sold';
    requested.status = 'sold';

    await offered.save({ transaction: t });
    await requested.save({ transaction: t });

    offer.status = 'accepted';
    await offer.save({ transaction: t });

    return offer;
  });
}

export async function decline({ offerId, userId }) {
  const offer = await TradeOffer.findByPk(offerId);
  if (!offer) throw Object.assign(new Error('Offer not found'), { status: 404 });
  if (offer.toUserId !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  offer.status = 'declined';
  await offer.save();
  return offer;
}

export async function cancel({ offerId, userId }) {
  const offer = await TradeOffer.findByPk(offerId);
  if (!offer) throw Object.assign(new Error('Offer not found'), { status: 404 });
  if (offer.fromUserId !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  offer.status = 'cancelled';
  await offer.save();
  return offer;
}

export default { offer, listReceived, listSent, accept, decline, cancel };
