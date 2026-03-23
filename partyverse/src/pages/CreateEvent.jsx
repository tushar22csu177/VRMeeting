import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/ui/Navigation";
import "./CreateEvent.css";
import { createEvent } from "../hooks/useEvents";

export default function CreateEvent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    image: null,
    durationMinutes: 120,
  });

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.date || !form.time || !form.venue) {
      alert("Please fill required fields (name, date, time, venue)");
      return;
    }

    const payload = {
      title: form.name,
      date: form.date,
      time: form.time,
      venue: form.venue,
      description: form.description,
      durationMinutes: form.durationMinutes,
      image: form.image, // file, handled as FormData
    };

    try {
      await createEvent(payload);
      alert("Event created successfully!");
      navigate("/events");
    } catch (err) {
      console.error("Create event error:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to create event. Are you signed in?";
      alert(msg);
    }
  }

  return (
    <div className="create-event-root">
      <Navigation />
      <main className="create-event-main">
        <h1 className="create-event-title">✨ Host an Event</h1>
        <form className="create-event-form" onSubmit={handleSubmit}>
          <label>
            Event Name
            <input
              type="text"
              name="name"
              value={form.name}
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
            Venue Type
            <select
              name="venue"
              value={form.venue}
              onChange={handleChange}
              required
            >
              <option value="">Select Venue</option>
              <option value="Neon Night Club">Neon Night Club</option>
              <option value="Rooftop Lounge">Rooftop Lounge</option>
              <option value="Beach Resort">Beach Resort</option>
            </select>
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
          <label>
            Event Image
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </label>
          <button className="host-btn" type="submit">
            Host Event
          </button>
        </form>
      </main>
    </div>
  );
}
