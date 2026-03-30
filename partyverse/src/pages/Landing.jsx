import React from "react";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing-hero">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="landing-navbar-logo">
          <span className="landing-navbar-title">PartyVerse</span>
        </div>

        <div className="landing-navbar-links">
          <a href="/partyverse" className="active-link">Home</a>
          <a href="/events">Events</a>
          <a href="/venues">Venues</a>

          {/* 🔥 ADD THIS ONLY */}
          <a href="/rooms">Rooms</a>
        </div>

        <div className="landing-navbar-auth">
          <a href="/auth" className="signin-link">Sign In</a>
          <a href="/auth/register" className="getstarted-link">
            Get Started
          </a>
        </div>
      </nav>

      {/* Main Block */}
      <section className="landing-main">
        <div className="landing-badge">
          🎉 The Future of Virtual Events
        </div>

        <h1 className="landing-title">
          Step into the Party
          <br />
          <span className="landing-title-highlight">
            Anywhere, Anytime
          </span>
        </h1>

        <p className="landing-subtext">
          Experience immersive AR/VR events. Connect with friends,
          dance at virtual venues, and host unforgettable parties
          in the metaverse.
        </p>

        {/* CTA */}
        <div className="landing-cta">
          <a href="/events">🕶️ Enter Event</a>

          <a href="/events/new" className="host-link">
            ✨ Host an Event
          </a>

          {/* 🔥 ADD THESE 2 BUTTONS */}
          <a href="/rooms" className="host-link">
            🏠 Join Rooms
          </a>

          <a href="/create-room" className="getstarted-link">
            🚀 Create Room
          </a>
        </div>
      </section>
    </div>
  );
}