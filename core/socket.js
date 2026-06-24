const { setIO } = require('./deployer');
const { readAppLog } = require('./logger');

function setupSocketHandlers(io) {
  // Wire socket into deployer for real-time emit
  setIO(io);

  io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Subscribe to app logs room
    socket.on('subscribe', async ({ appId }) => {
      socket.join(`app:${appId}`);
      console.log(`[WS] ${socket.id} subscribed to app:${appId}`);

      // Send recent log history immediately
      const logs = await readAppLog(appId, 150);
      socket.emit('logHistory', { appId, logs });
    });

    socket.on('unsubscribe', ({ appId }) => {
      socket.leave(`app:${appId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocketHandlers };
