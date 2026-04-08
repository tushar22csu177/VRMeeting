const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    date: { type: String, required: true },
    time: { type: String, required: true },

    meetingLink: { type: String, required: true },

    participants: [
      {
        email: String,
        name: String,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);