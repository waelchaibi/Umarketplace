import { Op, fn, col, literal } from 'sequelize';
import { sequelize, Product, User } from '../models/index.js';

export async function list({ page = 1, limit = 20, category, status = 'available', minPrice, maxPrice, condition, sort = 'createdAt', order = 'DESC' }) {
  const where = { isHidden: false };
  if (status) where.status = status;
  if (category) where.category = category;
  if (condition) where.condition = condition;
  if (minPrice || maxPrice) where.currentPrice = {};
  if (minPrice) where.currentPrice[Op.gte] = minPrice;
  if (maxPrice) where.currentPrice[Op.lte] = maxPrice;

  const offset = (Number(page) - 1) * Number(limit);
  const { rows, count } = await Product.findAndCountAll({
    where,
    include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }],
    order: [[sort, order]],
    limit: Number(limit),
    offset: Number(offset)
  });
  return { items: rows, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) };
}

export async function search({ q = '', page = 1, limit = 20 }) {
  const where = { status: 'available', [Op.or]: [
    { title: { [Op.like]: `%${q}%` } },
    { description: { [Op.like]: `%${q}%` } }
  ] };
  const offset = (Number(page) - 1) * Number(limit);
  const { rows, count } = await Product.findAndCountAll({ where, limit: Number(limit), offset: Number(offset), order: [['createdAt', 'DESC']] });
  return { items: rows, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) };
}

export async function categories() {
  const rows = await Product.findAll({ attributes: [[fn('DISTINCT', col('category')), 'category']], where: { category: { [Op.ne]: null } } });
  return rows.map(r => r.get('category'));
}

export async function getById(id) {
  const product = await Product.findByPk(id, { include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }] });
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  if (product.isHidden) throw Object.assign(new Error('Product not available'), { status: 404 });
  return product;
}

export async function getByUser(userId) {
  const rows = await Product.findAll({ where: { ownerId: userId }, order: [['createdAt', 'DESC']] });
  return rows;
}

export async function create({ adminId, title, description, category, originalPrice, currentPrice, condition, images }) {
  const admin = await User.findByPk(adminId);
  if (!admin || admin.role !== 'admin') throw Object.assign(new Error('Forbidden'), { status: 403 });
  const product = await Product.create({
    title,
    description,
    category,
    originalPrice,
    currentPrice,
    condition: condition || 'excellent',
    images: images || [],
    ownerId: adminId,
    originalOwnerId: adminId
  });
  return product;
}

export async function update({ id, changes }) {
  const product = await Product.findByPk(id);
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  const updatable = ['title', 'description', 'category', 'originalPrice', 'currentPrice', 'status', 'condition', 'images', 'ownerId'];
  updatable.forEach((f) => { if (changes[f] !== undefined) product[f] = changes[f]; });
  await product.save();
  return product;
}

export async function remove(id) {
  const product = await Product.findByPk(id);
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  await product.destroy();
  return true;
}

export default { list, search, categories, getById, getByUser, create, update, remove };
