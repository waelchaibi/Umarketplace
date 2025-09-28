import { Op } from 'sequelize';
import { Message, User } from '../models/index.js';
import { getIo } from '../config/socket.js';

export async function send({ senderId, receiverId, content, messageType = 'text' }) {
  const message = await Message.create({ senderId, receiverId, content, messageType });
  getIo().to(`user:${receiverId}`).emit('message:received', { from: senderId, content, createdAt: message.createdAt });
  return message;
}

export async function conversations(userId) {
  // Get distinct user ids from messages
  const msgs = await Message.findAll({ where: { [Op.or]: [{ senderId: userId }, { receiverId: userId }] }, order: [['createdAt', 'DESC']] });
  const set = new Set();
  const convos = [];
  for (const m of msgs) {
    const otherId = m.senderId === userId ? m.receiverId : m.senderId;
    if (!set.has(otherId)) { set.add(otherId); convos.push(otherId); }
  }
  const users = await User.findAll({ where: { id: { [Op.in]: Array.from(set) } }, attributes: ['id', 'username'] });
  return users;
}

export async function withUser({ userId, otherUserId }) {
  const msgs = await Message.findAll({ where: { [Op.or]: [
    { senderId: userId, receiverId: otherUserId },
    { senderId: otherUserId, receiverId: userId }
  ] }, order: [['createdAt', 'ASC']] });
  return msgs;
}

export async function markRead({ userId, messageId }) {
  const msg = await Message.findByPk(messageId);
  if (!msg) throw Object.assign(new Error('Message not found'), { status: 404 });
  if (msg.receiverId !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  msg.isRead = true;
  await msg.save();
  return msg;
}

export default { send, conversations, withUser, markRead };
