// socket.js

const { Server } = require("socket.io");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  const rooms = {}; // seat map
  const headRotations = {}; // NEW

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", ({ roomId, userId }) => {
      socket.join(roomId);

      if (!rooms[roomId]) rooms[roomId] = {};
      if (!headRotations[roomId]) headRotations[roomId] = {};

      socket.emit("seatState", rooms[roomId]);
      socket.emit("headState", headRotations[roomId]);
    });

    socket.on("takeSeat", ({ roomId, seatName, userId }) => {
      if (!rooms[roomId]) rooms[roomId] = {};

      if (rooms[roomId][seatName]) return;

      rooms[roomId][seatName] = userId;

      io.to(roomId).emit("seatUpdate", rooms[roomId]);
    });

    socket.on("headMove", ({ roomId, userId, rotation }) => {
      if (!headRotations[roomId]) headRotations[roomId] = {};

      headRotations[roomId][userId] = rotation;

      socket.to(roomId).emit("headUpdate", {
        userId,
        rotation,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = setupSocket;