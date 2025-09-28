import { User, Product } from '../models/index.js';
import * as ProductService from '../services/product.service.js';
import * as ActivityService from '../services/activity.service.js';

export async function createProduct(req, res, next) {
  try {
    const images = (req.files || []).map(f => `/uploads/${f.filename}`);
    const product = await ProductService.create({
      adminId: req.user.id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      originalPrice: req.body.originalPrice,
      currentPrice: req.body.currentPrice,
      condition: req.body.condition,
      images
    });
    await ActivityService.log({ actorUserId: req.user.id, action: 'product.create', targetType: 'product', targetId: product.id, metadata: { title: product.title } });
    res.json({ success: true, data: product });
  } catch (e) { next(e); }
}

export async function updateProduct(req, res, next) {
  try {
    const changes = { ...req.body };
    if (req.files && req.files.length) {
      changes.images = (req.files || []).map(f => `/uploads/${f.filename}`);
    }
    const data = await ProductService.update({ id: req.params.id, changes });
    await ActivityService.log({ actorUserId: req.user.id, action: 'product.update', targetType: 'product', targetId: data.id, metadata: changes });
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function deleteProduct(req, res, next) {
  try {
    await ProductService.remove(req.params.id);
    await ActivityService.log({ actorUserId: req.user.id, action: 'product.delete', targetType: 'product', targetId: Number(req.params.id) });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { next(e); }
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: users });
  } catch (e) { next(e); }
}

export async function changeUserRole(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    user.role = req.body.role;
    await user.save();
    await ActivityService.log({ actorUserId: req.user.id, action: 'user.role', targetType: 'user', targetId: user.id, metadata: { role: user.role } });
    res.json({ success: true, data: { id: user.id, role: user.role } });
  } catch (e) { next(e); }
}

export async function toggleUserSuspension(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    user.isSuspended = !!req.body.isSuspended;
    await user.save();
    await ActivityService.log({ actorUserId: req.user.id, action: 'user.suspend', targetType: 'user', targetId: user.id, metadata: { isSuspended: user.isSuspended } });
    res.json({ success: true, data: { id: user.id, isSuspended: user.isSuspended } });
  } catch (e) { next(e); }
}

export async function hideProduct(req, res, next) {
  try {
    const data = await ProductService.update({ id: req.params.id, changes: { isHidden: true } });
    await ActivityService.log({ actorUserId: req.user.id, action: 'product.hide', targetType: 'product', targetId: data.id });
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function unhideProduct(req, res, next) {
  try {
    const data = await ProductService.update({ id: req.params.id, changes: { isHidden: false } });
    await ActivityService.log({ actorUserId: req.user.id, action: 'product.unhide', targetType: 'product', targetId: data.id });
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function adminStats(req, res, next) {
  try {
    const data = await ActivityService.stats();
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function adminLogs(req, res, next) {
  try {
    const data = await ActivityService.recent({ limit: Number(req.query.limit || 100) });
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function listProducts(req, res, next) {
  try {
    const products = await Product.findAll({
      include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: products });
  } catch (e) { next(e); }
}

export default { createProduct, updateProduct, deleteProduct, listUsers, changeUserRole };
