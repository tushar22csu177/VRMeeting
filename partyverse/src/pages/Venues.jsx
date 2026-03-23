import React from "react";
import Navigation from "../components/ui/Navigation";
import { useNavigate } from "react-router-dom";
import "./Venues.css";

const venueData = [
  {
    emoji: "🎵",
    name: "Neon Night Club",
    desc: "Electric atmosphere with dance floors and DJ booths",
    capacity: 500,
    features: ["Dance Floor", "DJ Booth", "Laser Effects", "Voice Chat"],
  },
  {
    emoji: "🏙",
    name: "Rooftop Lounge",
    desc: "Stunning city views with chill vibes",
    capacity: 200,
    features: ["City Skyline", "Lounge Areas", "Bar", "Ambient Music"],
  },
  {
    emoji: "🏖",
    name: "Beach Resort",
    desc: "Tropical paradise with ocean waves",
    capacity: 400,
    features: ["Beach", "Bonfire", "Water Effects", "Sunset Views"],
  },
];

export default function Venues() {
  const navigate = useNavigate();

  return (
    <div className="venues-root">
      <Navigation />

      <div className="venues-header">
        <h1 className="venues-title">
          Virtual <span className="venues-title-highlight">Venues</span>
        </h1>
        <p className="venues-tagline">
          Explore stunning 3D venues for your next virtual event
        </p>
      </div>

      <main className="venues-cards-section">
        {venueData.map((venue, idx) => (
          <div className="venue-card" key={idx}>
            <div className="venue-icon">{venue.emoji}</div>

            <div className="venue-card-details">
              <h2 className="venue-card-title">{venue.name}</h2>
              <div className="venue-card-desc">{venue.desc}</div>

              <div className="venue-card-meta">
                <span className="venue-meta-label">Capacity:</span>
                Up to {venue.capacity} avatars
              </div>

              <div className="venue-card-meta">
                <span className="venue-meta-label">Features:</span>
                <div className="venue-feature-tags">
                  {venue.features.map((feat, i) => (
                    <span className="venue-feature-tag" key={i}>
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="venue-card-actions">
              <button
                className="venue-preview-btn"
                onClick={() => alert("Preview coming soon")}
              >
                Preview
              </button>

              <button
                className="venue-book-btn"
                onClick={() => navigate("/events/new")}
              >
                Book Venue
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}