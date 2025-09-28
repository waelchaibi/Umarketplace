import * as WalletService from '../services/wallet.service.js';

export async function balance(req, res, next) {
  try { const data = await WalletService.getBalance(req.user.id); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function addFunds(req, res, next) {
  try { const data = await WalletService.addFunds(req.user.id, Number(req.body.amount)); res.json({ success: true, data }); } catch (e) { next(e); }
}
export async function transactions(req, res, next) {
  try { const data = await WalletService.listTransactions(req.user.id); res.json({ success: true, data }); } catch (e) { next(e); }
}

export default { balance, addFunds, transactions };
