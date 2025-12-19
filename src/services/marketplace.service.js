import { sequelize, Product, User, Transaction } from '../models/index.js';

export async function createByUser({ ownerId, title, description, category, originalPrice, currentPrice, condition = 'excellent', images = [] }) {
  const user = await User.findByPk(ownerId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  const product = await Product.create({
    title,
    description,
    category,
    originalPrice,
    currentPrice,
    condition,
    images,
    ownerId,
    originalOwnerId: ownerId,
    status: 'available'
  });
  return product;
}
export async function buy(productId, buyerId) {
  return await sequelize.transaction(async (t) => {
    const product = await Product.findByPk(productId, { lock: t.LOCK.UPDATE, transaction: t });
    if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
    if (product.status !== 'available') throw Object.assign(new Error('Product not available'), { status: 400 });
    if (product.ownerId === buyerId) throw Object.assign(new Error('Cannot buy your own product'), { status: 400 });

    const buyer = await User.findByPk(buyerId, { transaction: t, lock: t.LOCK.UPDATE });
    const seller = await User.findByPk(product.ownerId, { transaction: t, lock: t.LOCK.UPDATE });

    const price = Number(product.currentPrice || product.originalPrice || 0);
    if (Number(buyer.balance) < price) throw Object.assign(new Error('Insufficient balance'), { status: 400 });

    buyer.balance = Number(buyer.balance) - price;
    seller.balance = Number(seller.balance) + price;

    await buyer.save({ transaction: t });
    await seller.save({ transaction: t });

    product.ownerId = buyerId;
    product.status = 'sold';
    await product.save({ transaction: t });

    const tx = await Transaction.create({
      fromUserId: buyerId,
      toUserId: seller.id,
      productId: product.id,
      type: 'sale',
      amount: price,
      status: 'completed'
    }, { transaction: t });

    return { product, transaction: tx };
  });
}

export async function sell({ ownerId, productId, price }) {
  const product = await Product.findByPk(productId);
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  if (product.ownerId !== ownerId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  product.status = 'available';
  if (price !== undefined) product.currentPrice = price;
  await product.save();
  return product;
}

export async function updatePrice({ ownerId, productId, price }) {
  const product = await Product.findByPk(productId);
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  if (product.ownerId !== ownerId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  product.currentPrice = price;
  await product.save();
  return product;
}

export default { buy, sell, updatePrice };
