// partyverse-backend/src/models/Event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    date: { type: String, required: true }, // e.g. "2025-11-22"
    time: { type: String, required: true }, // e.g. "18:30"

    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    venue: { type: String, required: true },
    description: String,

    imageUrl: { type: String }, // Cloudinary URL

    status: {
      type: String,
      enum: ["upcoming", "live", "ended"],
      default: "upcoming",
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
