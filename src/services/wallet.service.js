import { sequelize, User, Transaction, Product } from '../models/index.js';
import { Op } from 'sequelize';

export async function getBalance(userId) {
  const user = await User.findByPk(userId);
  return { balance: Number(user.balance) };
}

export async function addFunds(userId, amount) {
  if (amount <= 0) throw Object.assign(new Error('Invalid amount'), { status: 400 });
  const user = await User.findByPk(userId);
  user.balance = Number(user.balance) + Number(amount);
  await user.save();
  return { balance: Number(user.balance) };
}

export async function listTransactions(userId) {
  const rows = await Transaction.findAll({
    where: { [Op.or]: [{ fromUserId: userId }, { toUserId: userId }] },
    order: [['createdAt', 'DESC']],
    include: [{ model: Product, as: 'product', attributes: ['id', 'title'] }]
  });
  return rows;
}

export default { getBalance, addFunds, listTransactions };
