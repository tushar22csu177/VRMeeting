const express = require("express");
const Meeting = require("../models/Meeting");
const authRequired = require("../middleware/authMiddleware");

const router = express.Router();

/* CREATE MEETING */
router.post("/", authRequired, async (req, res) => {
  try {
    const meeting = await Meeting.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.json({ meeting });
  } catch (err) {
    res.status(500).json({ message: "Meeting create failed" });
  }
});

/* GET ALL */
router.get("/", async (req, res) => {
  const meetings = await Meeting.find().sort({ createdAt: -1 });
  res.json({ meetings });
});

module.exports = router;