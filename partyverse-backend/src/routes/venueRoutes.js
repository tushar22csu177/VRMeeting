// src/routes/venueRoutes.js
const express = require("express");
const router = express.Router();

// Simple demo data for now
const demoVenues = [
  {
    id: 1,
    name: "Neon Galaxy Arena",
    location: "Virtual Space - Global",
    capacity: 5000,
    description: "Immersive VR club with holographic lighting.",
    imageUrl: "https://placehold.co/600x400?text=Neon+Galaxy"
  },
  {
    id: 2,
    name: "Skyline Rooftop",
    location: "Metaverse City",
    capacity: 1200,
    description: "Host sunset parties above a futuristic skyline.",
    imageUrl: "https://placehold.co/600x400?text=Skyline+Rooftop"
  }
];

// GET /api/venues
router.get("/", (req, res) => {
  res.json({ venues: demoVenues });
});

module.exports = router;
