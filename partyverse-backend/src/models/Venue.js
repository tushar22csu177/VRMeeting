// src/models/Venue.js
const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number },
    description: { type: String },
    imageUrl: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Venue", venueSchema);
