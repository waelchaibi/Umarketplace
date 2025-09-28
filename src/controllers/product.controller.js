import * as ProductService from '../services/product.service.js';

export async function list(req, res, next) {
  try { const data = await ProductService.list(req.query); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function search(req, res, next) {
  try { const data = await ProductService.search({ q: req.query.q, page: req.query.page, limit: req.query.limit }); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function categories(req, res, next) {
  try { const data = await ProductService.categories(); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function get(req, res, next) {
  try { const data = await ProductService.getById(req.params.id); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function getByUser(req, res, next) {
  try { const data = await ProductService.getByUser(req.params.userId); res.json({ success: true, data }); } catch (e) { next(e); }
}

export default { list, search, categories, get, getByUser };
