import * as MarketplaceService from '../services/marketplace.service.js';
import { upload } from '../middleware/upload.js';

export async function buy(req, res, next) {
  try { const data = await MarketplaceService.buy(req.params.productId, req.user.id); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function sell(req, res, next) {
  try { const data = await MarketplaceService.sell({ ownerId: req.user.id, productId: req.body.productId, price: req.body.price }); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function updatePrice(req, res, next) {
  try { const data = await MarketplaceService.updatePrice({ ownerId: req.user.id, productId: req.params.productId, price: req.body.price }); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function createProduct(req, res, next) {
  try {
    const images = (req.files || []).map(f => `/uploads/${f.filename}`);
    const payload = {
      ownerId: req.user.id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      originalPrice: req.body.originalPrice,
      currentPrice: req.body.currentPrice,
      condition: req.body.condition || 'excellent',
      images
    };
    const data = await MarketplaceService.createByUser(payload);
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export default { buy, sell, updatePrice };
