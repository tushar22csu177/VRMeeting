// partyverse-backend/src/socket.js
// ✅ Multiplayer: join/leave/move/sit/stand + roomState broadcast

const { Server } = require("socket.io");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // roomId → { socketId → { position, avatarType, userId, seated, chairId } }
  const rooms    = {};
  // roomId → { chairId → socketId }  (for quick chair lookup)
  const chairMap = {};

  io.on("connection", (socket) => {
    console.log(`[+] ${socket.id} connected`);

    /* ─── Join room ──────────────────────────── */
    socket.on("joinRoom", ({ roomId, userId, avatarType }) => {
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.userId = userId;

      if (!rooms[roomId])    rooms[roomId]    = {};
      if (!chairMap[roomId]) chairMap[roomId] = {};

      rooms[roomId][socket.id] = {
        position:   [0, 0, 6],
        avatarType: avatarType || "male",
        userId:     userId || socket.id,
        seated:     false,
        chairId:    null,
      };

      // Send full state to newcomer
      socket.emit("seatState",  chairMap[roomId]);  // backwards compat
      socket.emit("roomState",  rooms[roomId]);

      // Tell others
      socket.to(roomId).emit("playerJoined", {
        socketId:   socket.id,
        position:   [0, 0, 6],
        avatarType: avatarType || "male",
      });

      console.log(`[room:${roomId}] ${Object.keys(rooms[roomId]).length} player(s)`);
    });

    /* ─── Free-roam movement ─────────────────── */
    socket.on("playerMove", ({ roomId, position, avatarType, seated, chairId }) => {
      if (!rooms[roomId]) return;
      const prev = rooms[roomId][socket.id] || {};
      rooms[roomId][socket.id] = {
        ...prev,
        position,
        avatarType: avatarType || "male",
        seated:  !!seated,
        chairId: chairId || null,
      };
      socket.to(roomId).emit("playerMoved", {
        socketId: socket.id,
        position,
        avatarType,
        seated:  !!seated,
        chairId: chairId || null,
      });
    });

    /* ─── Sit on chair ───────────────────────── */
    socket.on("takeSeat", ({ roomId, chairId }) => {
      if (!rooms[roomId] || !chairMap[roomId]) return;

      // Chair already taken by someone else?
      if (chairMap[roomId][chairId] && chairMap[roomId][chairId] !== socket.id) return;

      // Free any previous chair this player held
      const prev = rooms[roomId][socket.id];
      if (prev?.chairId && prev.chairId !== chairId) {
        delete chairMap[roomId][prev.chairId];
      }

      chairMap[roomId][chairId] = socket.id;
      if (rooms[roomId][socket.id]) {
        rooms[roomId][socket.id].seated  = true;
        rooms[roomId][socket.id].chairId = chairId;
      }

      // Broadcast updated chair occupancy
      io.to(roomId).emit("seatUpdate", chairMap[roomId]);
    });

    /* ─── Stand up ───────────────────────────── */
    socket.on("standUp", ({ roomId, chairId }) => {
      if (!rooms[roomId] || !chairMap[roomId]) return;

      delete chairMap[roomId][chairId];
      if (rooms[roomId][socket.id]) {
        rooms[roomId][socket.id].seated  = false;
        rooms[roomId][socket.id].chairId = null;
      }

      io.to(roomId).emit("seatUpdate",      chairMap[roomId]);
      io.to(roomId).emit("playerStoodUp",   { socketId: socket.id, chairId });
    });

    /* ─── Disconnect ─────────────────────────── */
    socket.on("disconnect", () => {
      const roomId = socket.data.roomId;
      console.log(`[-] ${socket.id} disconnected`);
      if (!roomId || !rooms[roomId]) return;

      // Free chair if player was seated
      const player = rooms[roomId][socket.id];
      if (player?.chairId && chairMap[roomId]) {
        delete chairMap[roomId][player.chairId];
        io.to(roomId).emit("seatUpdate", chairMap[roomId]);
      }

      delete rooms[roomId][socket.id];
      io.to(roomId).emit("playerLeft", { socketId: socket.id });

      if (Object.keys(rooms[roomId]).length === 0) {
        delete rooms[roomId];
        delete chairMap[roomId];
        console.log(`[room:${roomId}] empty — cleaned up`);
      }
    });
  });
}

module.exports = setupSocket;