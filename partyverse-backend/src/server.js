// src/server.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const http = require("http"); // 🔥 NEW
const setupSocket = require("./socket"); // 🔥 NEW

dotenv.config();

const app = express();

// DB
connectDB();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// CORS (IMPORTANT: keep above routes ideally)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://rv5p3h4n-5173.inc1.devtunnels.ms"
    ],
    credentials: true,
  })
);

// Routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const venueRoutes = require("./routes/venueRoutes");
const meetingRoutes = require("./routes/meetingRoutes");

// 🔥 NEW
const roomRoutes = require("./routes/roomRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/meetings", meetingRoutes);

// 🔥 NEW ROOMS API
app.use("/api/rooms", roomRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ===========================
   SOCKET SERVER SETUP
=========================== */

// 🔥 CREATE HTTP SERVER
const server = http.createServer(app);

// 🔥 ATTACH SOCKET.IO
setupSocket(server);

/* ===========================
   START SERVER
=========================== */

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});