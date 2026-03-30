const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: String,
    model: String, // "jazz_club"
    isPublic: Boolean,
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);