import { Server } from 'socket.io';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean) || '*',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('register:user', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on('join:auction', (auctionId) => {
      if (auctionId) socket.join(`auction:${auctionId}`);
    });
  });

  return io;
}

export function getIo() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export default { initSocket, getIo };
