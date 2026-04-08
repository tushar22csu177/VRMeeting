const express = require("express");
const Room = require("../models/Room");
const Invite = require("../models/Invite");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* ===========================
   CREATE ROOM
=========================== */
router.post("/", auth, async (req, res) => {
  try {
    const { name, model, isPublic } = req.body;

    const room = await Room.create({
      name,
      model,
      isPublic,
      host: req.user._id,
      participants: [req.user._id],
    });

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating room" });
  }
});

/* ===========================
   🔥 GET ALL ROOMS (FIXED)
=========================== */
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().populate("host");
    res.json(rooms); // ✅ ARRAY (important)
  } catch (err) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

/* ===========================
   GET PUBLIC ROOMS
=========================== */
router.get("/public", async (req, res) => {
  try {
    const rooms = await Room.find({ isPublic: true }).populate("host");
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching public rooms" });
  }
});

/* ===========================
   🔥 GET SINGLE ROOM (VERY IMPORTANT)
=========================== */
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("host");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: "Error fetching room" });
  }
});

/* ===========================
   INVITE USER
=========================== */
router.post("/invite", auth, async (req, res) => {
  try {
    const { roomId, email } = req.body;

    const invite = await Invite.create({
      room: roomId,
      email,
    });

    res.json(invite);
  } catch (err) {
    res.status(500).json({ message: "Error sending invite" });
  }
});

/* ===========================
   GET MY INVITES
=========================== */
router.get("/invites", auth, async (req, res) => {
  try {
    const invites = await Invite.find({
      email: req.user.email,
    }).populate("room");

    res.json(invites);
  } catch (err) {
    res.status(500).json({ message: "Error fetching invites" });
  }
});

/* ===========================
   ACCEPT INVITE
=========================== */
router.post("/accept", auth, async (req, res) => {
  try {
    const { inviteId } = req.body;

    const invite = await Invite.findById(inviteId);

    invite.status = "accepted";
    await invite.save();

    await Room.findByIdAndUpdate(invite.room, {
      $push: { participants: req.user._id },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error accepting invite" });
  }
});

module.exports = router;