const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: String,
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invite", inviteSchema);