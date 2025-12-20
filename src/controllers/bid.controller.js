import { Bid, Auction, Product } from '../models/index.js';

export async function listMine(req, res, next) {
  try {
    const rows = await Bid.findAll({
      where: { bidderId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Auction,
          as: 'auction',
          attributes: ['id', 'status', 'currentBid', 'currentBidderId', 'endTime'],
          include: [{ model: Product, as: 'product', attributes: ['id', 'title'] }]
        }
      ]
    });
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
}

export default { listMine };


