// src/config/db.js
const mongoose = require("mongoose");

async function connectDB() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);   // 👈 yeh line add karo
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
