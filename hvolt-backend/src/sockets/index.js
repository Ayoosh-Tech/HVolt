const jwt = require("jsonwebtoken");

/**
 * Wires up Socket.IO for real-time outage/restoration updates.
 *
 * Rooms:
 *  - `neighborhood:<id>` — clients viewing/following a neighborhood join this room
 *    to receive `report:new`, `report:updated`, and `neighborhood:update` events.
 *  - `user:<id>`         — a signed-in user's private room, used for personal
 *    notifications (e.g. "power restored in an area you follow").
 */
function initSocket(io) {
  io.use((socket, next) => {
    // Auth is optional for read-only map viewers, but attaches req.user when a
    // valid token is provided so we can join their personal notification room.
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.sub;
      next();
    } catch {
      next(); // treat as anonymous rather than rejecting the connection
    }
  });

  io.on("connection", (socket) => {
    if (socket.userId) socket.join(`user:${socket.userId}`);

    socket.on("neighborhood:subscribe", (neighborhoodId) => {
      socket.join(`neighborhood:${neighborhoodId}`);
    });

    socket.on("neighborhood:unsubscribe", (neighborhoodId) => {
      socket.leave(`neighborhood:${neighborhoodId}`);
    });

    socket.on("disconnect", () => {
      // no-op — Socket.IO cleans up room membership automatically
    });
  });
}

module.exports = initSocket;
