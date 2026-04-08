// partyverse/src/pages/EventDashboard.jsx
import React, { useEffect, useState } from "react";
import Navigation from "../components/ui/Navigation";
import "./EventDashboard.css";
import {
  fetchMyEvents,
  updateEvent,
  deleteEvent,
  deletePastEvents,
} from "../hooks/useEvents";

export default function EventDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    durationMinutes: 120,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyEvents();
        setEvents(data || []);
      } catch (err) {
        console.error("Failed to load my events", err);
        alert("Failed to load your events. Are you logged in?");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  function startEdit(event) {
    setEditingId(event._id);
    setForm({
      title: event.title || "",
      date: event.date || "",
      time: event.time || "",
      venue: event.venue || "",
      description: event.description || "",
      durationMinutes: event.durationMinutes || 120,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      title: "",
      date: "",
      time: "",
      venue: "",
      description: "",
      durationMinutes: 120,
    });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!editingId) return;

    try {
      const updated = await updateEvent(editingId, {
        title: form.title,
        date: form.date,
        time: form.time,
        venue: form.venue,
        description: form.description,
        durationMinutes: form.durationMinutes,
      });

      setEvents((prev) =>
        prev.map((ev) => (ev._id === updated._id ? updated : ev))
      );
      cancelEdit();
      alert("Event updated");
    } catch (err) {
      console.error("Update event error", err);
      alert(err.response?.data?.message || "Failed to update event");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this event?")) return;

    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      console.error("Delete event error", err);
      alert(err.response?.data?.message || "Failed to delete event");
    }
  }

  async function handleDeletePast() {
    if (!window.confirm("Delete ALL your past events? This cannot be undone.")) {
      return;
    }

    try {
      const result = await deletePastEvents();
      alert(
        `Deleted ${result.deletedCount || 0} past event(s).`
      );
      // Reload events list
      const data = await fetchMyEvents();
      setEvents(data || []);
      setEditingId(null);
    } catch (err) {
      console.error("Delete past events error", err);
      alert(
        err.response?.data?.message ||
          "Failed to delete past events"
      );
    }
  }

  const activeEvents = events.filter(
    (ev) => ev.status === "live" || ev.status === "upcoming"
  );
  const pastEvents = events.filter(
    (ev) => ev.status === "ended" || ev.status === "past"
  );

  const statusLabel = (status) => {
    if (status === "live") return "Live";
    if (status === "upcoming") return "Upcoming";
    return "Past";
  };

  return (
    <div className="dashboard-root">
      <Navigation />

      <main className="dashboard-main">
        <h1 className="dashboard-title">🎛 Your Hosted Events</h1>
        <p className="dashboard-subtitle">
          Manage, edit, or cancel the events you've created.
        </p>

        {/* Delete all past events button */}
        {pastEvents.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <button className="btn-small danger" onClick={handleDeletePast}>
              Delete All Past Events ({pastEvents.length})
            </button>
          </div>
        )}

        {loading && <p className="dashboard-loading">Loading...</p>}

        {!loading && events.length === 0 && (
          <p className="dashboard-empty">
            You haven't hosted any events yet. Go to{" "}
            <strong>Host Event</strong> to create one.
          </p>
        )}

        {!loading && events.length > 0 && (
          <div className="dashboard-grid">
            {/* LEFT: list of events */}
            <section className="dashboard-events-list">
              {activeEvents.length > 0 && (
                <>
                  <h2>Active Events</h2>
                  {activeEvents.map((event) => (
                    <div
                      key={event._id}
                      className={`dashboard-event-card ${
                        editingId === event._id ? "editing" : ""
                      }`}
                    >
                      <div className="dashboard-event-header">
                        <h2>{event.title}</h2>
                        <span className={`status-chip ${event.status}`}>
                          {statusLabel(event.status)}
                        </span>
                      </div>

                      <p className="dashboard-event-meta">
                        {event.date} · {event.time} · {event.venue}
                      </p>

                      {event.description && (
                        <p className="dashboard-event-desc">
                          {event.description}
                        </p>
                      )}

                      <div className="dashboard-event-actions">
                        <button
                          onClick={() => startEdit(event)}
                          className="btn-small primary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="btn-small danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {pastEvents.length > 0 && (
                <>
                  <h2>Past Events</h2>
                  {pastEvents.map((event) => (
                    <div
                      key={event._id}
                      className={`dashboard-event-card ${
                        editingId === event._id ? "editing" : ""
                      }`}
                    >
                      <div className="dashboard-event-header">
                        <h2>{event.title}</h2>
                        <span className={`status-chip ${event.status}`}>
                          {statusLabel(event.status)}
                        </span>
                      </div>

                      <p className="dashboard-event-meta">
                        {event.date} · {event.time} · {event.venue}
                      </p>

                      {event.description && (
                        <p className="dashboard-event-desc">
                          {event.description}
                        </p>
                      )}

                      <div className="dashboard-event-actions">
                        <button
                          onClick={() => startEdit(event)}
                          className="btn-small primary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="btn-small danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </section>

            {/* RIGHT: edit panel */}
            <section className="dashboard-edit-panel">
              {editingId ? (
                <form onSubmit={handleSave} className="edit-form">
                  <h2>Edit Event</h2>

                  <label>
                    Title
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Date
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Time
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Duration (minutes)
                    <input
                      type="number"
                      name="durationMinutes"
                      min="15"
                      step="15"
                      value={form.durationMinutes}
                      onChange={handleChange}
                    />
                  </label>

                  <label>
                    Venue
                    <input
                      type="text"
                      name="venue"
                      value={form.venue}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                    />
                  </label>

                  <div className="edit-form-actions">
                    <button type="submit" className="btn-main">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="dashboard-edit-placeholder">
                  <h2>Select an event</h2>
                  <p>
                    Click on <strong>Edit</strong> on any event card to modify
                    its details.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
