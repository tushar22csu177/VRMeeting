const { Server } = require("socket.io");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  const rooms = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    /* JOIN ROOM */
    socket.on("joinRoom", ({ roomId }) => {
      socket.join(roomId);

      if (!rooms[roomId]) rooms[roomId] = {};

      socket.emit("seatState", rooms[roomId]);
    });

    /* TAKE SEAT (FIXED) */
    socket.on("takeSeat", ({ roomId, seatName, userId, name, position, avatarType }) => {
      if (!rooms[roomId]) rooms[roomId] = {};

      if (rooms[roomId][seatName]) return;

      rooms[roomId][seatName] = {
        userId,
        name,
        position,
        rotation: [0, 0, 0],
        avatarType,
      };

      io.to(roomId).emit("seatUpdate", rooms[roomId]);
    });

    /* HEAD MOVE */
    socket.on("headMove", ({ roomId, rotation }) => {
      if (!rooms[roomId]) return;

      for (let seat in rooms[roomId]) {
        if (rooms[roomId][seat].userId === socket.id) {
          rooms[roomId][seat].rotation = rotation;
        }
      }

      io.to(roomId).emit("seatUpdate", rooms[roomId]);
    });

    /* LEAVE */
    socket.on("leaveSeat", ({ roomId, seatName }) => {
      if (!rooms[roomId]) return;

      delete rooms[roomId][seatName];

      io.to(roomId).emit("seatUpdate", rooms[roomId]);
    });

    /* DISCONNECT */
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      for (let roomId in rooms) {
        for (let seat in rooms[roomId]) {
          if (rooms[roomId][seat].userId === socket.id) {
            delete rooms[roomId][seat];
          }
        }

        io.to(roomId).emit("seatUpdate", rooms[roomId]);
      }
    });
  });
}

module.exports = setupSocket;