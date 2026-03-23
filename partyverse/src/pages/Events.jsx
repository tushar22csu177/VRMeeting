import React, { useEffect, useState } from "react";
import "./Events.css";
import { fetchEvents } from "../hooks/useEvents";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data || []);
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    if (filter === "live") return event.status === "live";
    if (filter === "upcoming") return event.status === "upcoming";
    return true; // "all"
  });

  const chipClass = (s) =>
    s === "live"
      ? "event-chip live"
      : s === "upcoming"
      ? "event-chip upcoming"
      : "event-chip";

  const chipLabel = (s) =>
    s === "live" ? "Live Now" : s === "upcoming" ? "Upcoming" : "Past";

  const icon = (s) => (s === "live" ? "🎵" : s === "upcoming" ? "🌅" : "⚡");

  return (
    <div className="events-root">
      {/* Navbar */}
      <nav className="events-navbar">
        <div className="events-navbar-logo">
          <span className="events-navbar-title">PartyVerse</span>
        </div>
        <div className="events-navbar-links">
          <a href="/">Home</a>
          <a href="/events" className="active-link">
            Events
          </a>
          <a href="/venues">Venues</a>
        </div>
        <div className="events-navbar-auth">
          <a href="/auth">Sign In</a>
          <a href="/auth/register" className="getstarted-link">
            Get Started
          </a>
        </div>
      </nav>

      {/* Header */}
      <header className="events-header-section">
        <h1 className="events-title">
          Discover <span className="events-title-highlight">Virtual Events</span>
        </h1>
        <p className="events-tagline">
          Join live events or explore upcoming parties in immersive AR/VR
          experiences
        </p>

        <div className="events-filter-bar">
          <button
            className={`events-filter ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Events
          </button>
          <button
            className={`events-filter ${filter === "live" ? "active" : ""}`}
            onClick={() => setFilter("live")}
          >
            Live Now
          </button>
          <button
            className={`events-filter ${filter === "upcoming" ? "active" : ""}`}
            onClick={() => setFilter("upcoming")}
          >
            Upcoming
          </button>
        </div>
      </header>

      {/* Event Cards Section */}
      <main className="events-cards-section">
        {loading && <p>Loading events…</p>}

        {!loading && filteredEvents.length === 0 && (
          <p className="events-empty-state">
            No events found for this filter. Try hosting one from the Host Event
            page.
          </p>
        )}

        {!loading &&
          filteredEvents.map((event) => (
            <div className="event-card" key={event._id}>
              <div className="event-card-icon-row">
                <span className="event-icon">{icon(event.status)}</span>
                <span className={chipClass(event.status)}>
                  {chipLabel(event.status)}
                </span>
              </div>

              {/* Event image (from Cloudinary) */}
              {event.imageUrl && (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="event-banner"
                />
              )}

              <div className="event-card-content">
                <h2 className="event-card-title">{event.title}</h2>
                <div className="event-card-venue">{event.venue}</div>
                <ul className="event-card-meta">
                  <li>{event.date}</li>
                  <li>{event.time}</li>
                  <li>VR</li>
                </ul>

                {event.description && (
                  <p className="event-card-description">
                    {event.description}
                  </p>
                )}
              </div>

              <div className="event-card-action">
                {event.status === "live" ? (
                  <button className="primary-glow">Join Now</button>
                ) : (
                  <button className="secondary-outline">View Details</button>
                )}
              </div>
            </div>
          ))}
      </main>
    </div>
  );
}
