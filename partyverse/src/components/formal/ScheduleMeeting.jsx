import { useState } from "react";
import { createMeeting } from "../../hooks/useMeetings";
import "./FormalDashboard.css";

export default function ScheduleMeeting() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    meetingLink: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await createMeeting(form);
    alert("Meeting Scheduled!");
  }

  return (
    <div className="formal-content">
      <h2>Schedule Meeting</h2>

      <form onSubmit={handleSubmit} className="schedule-form">
        <input name="title" placeholder="Title" onChange={handleChange} required />
        <input name="description" placeholder="Description" onChange={handleChange} />
        <input type="date" name="date" onChange={handleChange} required />
        <input type="time" name="time" onChange={handleChange} required />
        <input name="meetingLink" placeholder="Meeting Link" onChange={handleChange} required />

        <button>Schedule</button>
      </form>
    </div>
  );
}