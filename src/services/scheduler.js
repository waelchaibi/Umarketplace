import * as AuctionService from './auction.service.js';

let timer;
export function startScheduler() {
  if (timer) return;
  timer = setInterval(async () => {
    try { await AuctionService.closeExpired(); } catch (e) { /* silent */ }
  }, 30000);
}

export default { startScheduler };
