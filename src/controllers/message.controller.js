import * as MessageService from '../services/message.service.js';

export async function send(req, res, next) {
  try { const data = await MessageService.send({ senderId: req.user.id, receiverId: req.body.receiverId, content: req.body.content, messageType: req.body.messageType }); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function conversations(req, res, next) {
  try { const data = await MessageService.conversations(req.user.id); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function withUser(req, res, next) {
  try { const data = await MessageService.withUser({ userId: req.user.id, otherUserId: req.params.userId }); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function markRead(req, res, next) {
  try { const data = await MessageService.markRead({ userId: req.user.id, messageId: req.params.id }); res.json({ success: true, data }); } catch (e) { next(e); }
}

export default { send, conversations, withUser, markRead };
