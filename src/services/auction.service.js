import { sequelize, Auction, Bid, Product, User, Transaction } from '../models/index.js';
import { Op } from 'sequelize';
import { getIo } from '../config/socket.js';

const MIN_INCREMENT = 1; // minimal increment

export async function create({ sellerId, productId, startingPrice, startTime, endTime }) {
  return await sequelize.transaction(async (t) => {
    const product = await Product.findByPk(productId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
    if (product.ownerId !== sellerId) throw Object.assign(new Error('Forbidden'), { status: 403 });
    if (product.status === 'sold') throw Object.assign(new Error('Product already sold'), { status: 400 });

    product.status = 'in_auction';
    await product.save({ transaction: t });

    const auction = await Auction.create({
      productId,
      sellerId,
      startingPrice,
      currentBid: null,
      currentBidderId: null,
      startTime: startTime || new Date(),
      endTime,
      status: 'active'
    }, { transaction: t });

    return auction;
  });
}

export async function listActive() {
  return await Auction.findAll({ where: { status: 'active' }, include: [{ model: Product, as: 'product' }] });
}

export async function getById(id) {
  const auction = await Auction.findByPk(id, {
    include: [
      { model: Product, as: 'product' },
      {
        model: Bid,
        as: 'bids',
        include: [{ model: User, as: 'bidder', attributes: ['id', 'username'] }],
        order: [['createdAt', 'DESC']]
      }
    ]
  });
  if (!auction) throw Object.assign(new Error('Auction not found'), { status: 404 });
  return auction;
}

export async function placeBid({ auctionId, bidderId, amount }) {
  return await sequelize.transaction(async (t) => {
    const auction = await Auction.findByPk(auctionId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!auction) throw Object.assign(new Error('Auction not found'), { status: 404 });
    if (auction.status !== 'active') throw Object.assign(new Error('Auction not active'), { status: 400 });
    if (new Date(auction.endTime) <= new Date()) throw Object.assign(new Error('Auction ended'), { status: 400 });

    const product = await Product.findByPk(auction.productId, { transaction: t });
    if (product.ownerId === bidderId) throw Object.assign(new Error('Cannot bid on your own product'), { status: 400 });

    const minAcceptable = Number(auction.currentBid || auction.startingPrice) + MIN_INCREMENT;
    if (Number(amount) < minAcceptable) throw Object.assign(new Error(`Minimum bid is ${minAcceptable}`), { status: 400 });

    // Balance checks and holds
    // Release previous highest bidder hold (if any)
    if (auction.currentBidderId) {
      const prevBidder = await User.findByPk(auction.currentBidderId, { transaction: t, lock: t.LOCK.UPDATE });
      const prevHold = await Transaction.findOne({
        where: {
          fromUserId: auction.currentBidderId,
          productId: auction.productId,
          type: 'auction_hold',
          status: 'pending'
        },
        transaction: t,
        lock: t.LOCK.UPDATE
      });
      if (prevHold) {
        prevBidder.balance = Number(prevBidder.balance) + Number(prevHold.amount);
        await prevBidder.save({ transaction: t });
        prevHold.status = 'cancelled';
        await prevHold.save({ transaction: t });
      }
    }

    // Place hold for new bidder
    const bidder = await User.findByPk(bidderId, { transaction: t, lock: t.LOCK.UPDATE });
    if (Number(bidder.balance) < Number(amount)) throw Object.assign(new Error('Insufficient balance'), { status: 400 });
    bidder.balance = Number(bidder.balance) - Number(amount);
    await bidder.save({ transaction: t });
    await Transaction.create({
      fromUserId: bidderId,
      toUserId: auction.sellerId,
      productId: auction.productId,
      type: 'auction_hold',
      amount: Number(amount),
      status: 'pending'
    }, { transaction: t });

    const bid = await Bid.create({ auctionId, bidderId, amount }, { transaction: t });
    auction.currentBid = amount;
    auction.currentBidderId = bidderId;
    await auction.save({ transaction: t });

    getIo().to(`auction:${auctionId}`).emit('auction:new_bid', { auctionId, amount: Number(amount), bidderId });
    return { auction, bid };
  });
}

export async function cancel({ auctionId, sellerId }) {
  return await sequelize.transaction(async (t) => {
    const auction = await Auction.findByPk(auctionId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!auction) throw Object.assign(new Error('Auction not found'), { status: 404 });
    if (auction.sellerId !== sellerId) throw Object.assign(new Error('Forbidden'), { status: 403 });
    if (auction.status !== 'active') throw Object.assign(new Error('Cannot cancel'), { status: 400 });

    const product = await Product.findByPk(auction.productId, { transaction: t });
    product.status = 'available';
    await product.save({ transaction: t });

    auction.status = 'cancelled';
    await auction.save({ transaction: t });

    return auction;
  });
}

export async function closeExpired() {
  const now = new Date();
  const expired = await Auction.findAll({ where: { status: 'active', endTime: { [Op.lte]: now } } });
  for (const auction of expired) {
    // Close in a transaction
    await sequelize.transaction(async (t) => {
      const a = await Auction.findByPk(auction.id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!a || a.status !== 'active') return;

      const product = await Product.findByPk(a.productId, { transaction: t, lock: t.LOCK.UPDATE });
      if (a.currentBidderId) {
        const winner = await User.findByPk(a.currentBidderId, { transaction: t, lock: t.LOCK.UPDATE });
        const seller = await User.findByPk(a.sellerId, { transaction: t, lock: t.LOCK.UPDATE });
        const price = Number(a.currentBid);
        // Check if there is an existing hold
        const hold = await Transaction.findOne({
          where: { fromUserId: winner.id, productId: product.id, type: 'auction_hold', status: 'pending' },
          transaction: t,
          lock: t.LOCK.UPDATE
        });
        if (hold) {
          // Funds already held; credit seller and convert hold to final
          seller.balance = Number(seller.balance) + price;
          await seller.save({ transaction: t });
          hold.type = 'auction_win';
          hold.toUserId = seller.id;
          hold.status = 'completed';
          await hold.save({ transaction: t });

          product.ownerId = winner.id;
          product.status = 'sold';
          await product.save({ transaction: t });
        } else {
          // Legacy path: charge winner now if enough balance
          if (Number(winner.balance) >= price) {
            winner.balance = Number(winner.balance) - price;
            seller.balance = Number(seller.balance) + price;
            await winner.save({ transaction: t });
            await seller.save({ transaction: t });

            product.ownerId = winner.id;
            product.status = 'sold';
            await product.save({ transaction: t });

            await Transaction.create({ fromUserId: winner.id, toUserId: seller.id, productId: product.id, type: 'auction_win', amount: price, status: 'completed' }, { transaction: t });
          } else {
            // Winner cannot pay: revert to available
            product.status = 'available';
            await product.save({ transaction: t });
          }
        }
      } else {
        // No bids, make product available again
        product.status = 'available';
        await product.save({ transaction: t });
      }

      a.status = 'ended';
      await a.save({ transaction: t });

      getIo().to(`auction:${a.id}`).emit('auction:ended', { auctionId: a.id, winnerId: a.currentBidderId || null, finalPrice: a.currentBid || null });
    });
  }
}

export default { create, listActive, getById, placeBid, cancel, closeExpired };
