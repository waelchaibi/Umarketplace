import * as AuctionService from '../services/auction.service.js';

export async function create(req, res, next) {
  try { const data = await AuctionService.create({ sellerId: req.user.id, productId: req.body.productId, startingPrice: req.body.startingPrice, startTime: req.body.startTime, endTime: req.body.endTime }); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function list(req, res, next) {
  try { const data = await AuctionService.listActive(); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function get(req, res, next) {
  try { const data = await AuctionService.getById(req.params.id); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function bid(req, res, next) {
  try { const data = await AuctionService.placeBid({ auctionId: req.params.id, bidderId: req.user.id, amount: Number(req.body.amount) }); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function cancel(req, res, next) {
  try { const data = await AuctionService.cancel({ auctionId: req.params.id, sellerId: req.user.id }); res.json({ success: true, data }); } catch (e) { next(e); }
}

export default { create, list, get, bid, cancel };
