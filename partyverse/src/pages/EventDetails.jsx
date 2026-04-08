// src/pages/EventDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "../components/ui/Navigation";
import "./EventDetails.css";
import { fetchEventById } from "../hooks/useEvents";

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchEventById(id);
        setEvent(data);
      } catch (err) {
        console.error("Failed to fetch event", err);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const chipClass = (s) =>
    s === "live"
      ? "event-details-chip live"
      : s === "upcoming"
      ? "event-details-chip upcoming"
      : "event-details-chip ended";

  const chipLabel = (s) =>
    s === "live" ? "Live Now" : s === "upcoming" ? "Upcoming" : "Past";

  if (loading) {
    return (
      <div className="event-details-wrapper">
        <Navigation />
        <div className="event-details-container">
          <p>Loading event…</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-details-wrapper">
        <Navigation />
        <div className="event-details-container">
          <p>{error || "Event not found"}</p>
          <Link to="/events" className="event-details-back">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="event-details-wrapper">
      <Navigation />

      <div className="event-details-container">
        {/* Status chip */}
        <span className={chipClass(event.status)}>
          {chipLabel(event.status)}
        </span>

        {/* Banner image */}
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="event-details-banner"
          />
        )}

        {/* Title & venue */}
        <h1 className="event-details-title">{event.title}</h1>
        <div className="event-details-venue">{event.venue}</div>

        {/* Meta info */}
       <ul className="event-details-meta">
  <li><strong>Date:</strong> {event.date}</li>
  <li><strong>Time:</strong> {event.time}</li>
  <li><strong>Venue:</strong> {event.venue}</li>
</ul>

<div className="event-details-host">
  <h3>Hosted By</h3>
  <p><strong>{event.host?.name}</strong></p>
  <p>{event.host?.email}</p>
  <p className="event-host-role">{event.host?.role}</p>
</div>


        {/* Description */}
        {event.description && (
          <p className="event-details-description">{event.description}</p>
        )}

        {/* Actions */}
      {event.status === "live" && (
  <button className="event-details-btn-primary">
    🔴 Join Live Event
  </button>
)}

{event.status === "upcoming" && (
  <button className="event-details-btn-secondary">
    ⏰ Set Reminder
  </button>
)}

{event.status === "ended" && (
  <button className="event-details-btn-disabled" disabled>
    Event Ended
  </button>
)}


        <br />

        <Link to="/events" className="event-details-back">
          ← Back to Events
        </Link>
      </div>
    </div>
  );
}
