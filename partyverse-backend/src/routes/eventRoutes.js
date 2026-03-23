// partyverse-backend/src/routes/eventRoutes.js
const express = require("express");
const Event = require("../models/Event");
const authRequired = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// Helper to compute LIVE / UPCOMING / ENDED
function computeStatus(startAt, endAt) {
  const now = new Date();
  if (now < startAt) return "upcoming";
  if (now >= startAt && now <= endAt) return "live";
  return "ended";
}

/**
 * GET /api/events
 * Public – list all events
 */
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ startAt: 1 }).lean();

    const updated = events.map((e) => ({
      ...e,
      status: computeStatus(e.startAt, e.endAt),
    }));

    res.json({ events: updated });
  } catch (err) {
    console.error("Get events error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/events/my
 * Protected – events hosted by the logged-in user
 */
router.get("/my", authRequired, async (req, res) => {
  try {
    const events = await Event.find({ host: req.user._id })
      .sort({ startAt: 1 })
      .lean();

    const updated = events.map((e) => ({
      ...e,
      status: computeStatus(e.startAt, e.endAt),
    }));

    res.json({ events: updated });
  } catch (err) {
    console.error("Get my events error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/events/cleanup/past
 * Protected – delete all past events of current user
 */
router.delete("/cleanup/past", authRequired, async (req, res) => {
  try {
    const now = new Date();

    const result = await Event.deleteMany({
      host: req.user._id,
      endAt: { $lt: now },
    });

    res.json({
      deletedCount: result.deletedCount,
      message: "Past events deleted successfully",
    });
  } catch (err) {
    console.error("Cleanup past events error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/events/:id
 * Public – single event details (with host info)
 */
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("host", "name email role")
      .lean();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const status = computeStatus(event.startAt, event.endAt);

    res.json({ event: { ...event, status } });
  } catch (err) {
    console.error("Get event by id error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/events
 * Protected – create new event (with optional image)
 */
router.post("/", authRequired, upload.single("image"), async (req, res) => {
  try {
    const { title, date, time, venue, description, durationMinutes } = req.body;

    if (!title || !date || !time || !venue) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const startAt = new Date(`${date}T${time}:00`);
    if (isNaN(startAt.getTime())) {
      return res.status(400).json({ message: "Invalid date or time" });
    }

    const duration = Number(durationMinutes) || 120;
    const endAt = new Date(startAt.getTime() + duration * 60 * 1000);
    const status = computeStatus(startAt, endAt);
    const imageUrl = req.file?.path || null;

    const event = await Event.create({
      title,
      date,
      time,
      venue,
      description,
      startAt,
      endAt,
      durationMinutes: duration,
      status,
      imageUrl,
      host: req.user._id,
    });

    res.status(201).json({ event });
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/events/:id
 * Protected – update event (only by its host)
 */
router.put("/:id", authRequired, upload.single("image"), async (req, res) => {
  try {
    const existing = await Event.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (existing.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to edit this event" });
    }

    const {
      title,
      date,
      time,
      venue,
      description,
      durationMinutes,
    } = req.body;

    if (title) existing.title = title;
    if (venue) existing.venue = venue;
    if (description !== undefined) existing.description = description;

    const effectiveDate = date || existing.date;
    const effectiveTime = time || existing.time;
    existing.date = effectiveDate;
    existing.time = effectiveTime;

    const startAt = new Date(`${effectiveDate}T${effectiveTime}:00`);
    const duration = Number(durationMinutes || existing.durationMinutes || 120);
    const endAt = new Date(startAt.getTime() + duration * 60 * 1000);

    existing.startAt = startAt;
    existing.endAt = endAt;
    existing.durationMinutes = duration;
    existing.status = computeStatus(startAt, endAt);

    if (req.file?.path) {
      existing.imageUrl = req.file.path;
    }

    await existing.save();
    res.json({ event: existing });
  } catch (err) {
    console.error("Update event error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/events/:id
 * Protected – delete event (only by its host)
 */
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      host: req.user._id,
    });

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found or not owned by you" });
    }

    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
