import * as TradeService from '../services/trade.service.js';

export async function offer(req, res, next) {
  try { const data = await TradeService.offer({ fromUserId: req.user.id, toUserId: req.body.toUserId, offeredProductId: req.body.offeredProductId, requestedProductId: req.body.requestedProductId, additionalAmount: req.body.additionalAmount, message: req.body.message }); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function received(req, res, next) {
  try { const data = await TradeService.listReceived(req.user.id); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function sent(req, res, next) {
  try { const data = await TradeService.listSent(req.user.id); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function accept(req, res, next) {
  try { const data = await TradeService.accept({ offerId: req.params.id, userId: req.user.id }); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function decline(req, res, next) {
  try { const data = await TradeService.decline({ offerId: req.params.id, userId: req.user.id }); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function cancel(req, res, next) {
  try { const data = await TradeService.cancel({ offerId: req.params.id, userId: req.user.id }); res.json({ success: true, data }); } catch (e) { next(e); }
}

export default { offer, received, sent, accept, decline, cancel };
