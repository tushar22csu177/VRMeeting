import { useState } from "react";
import { createMeeting } from "../../hooks/useMeetings";

export default function CreateMeeting() {
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    meetingLink: "",
    participants: "",
  });
  

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const participants = form.participants
      .split(",")
      .map((email) => ({ email }));

    await createMeeting({ ...form, participants });

    alert("Meeting Created");
  }

  return (
    <div style={{ padding: 50 }}>
      <h1>Create Meeting</h1>

      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" onChange={handleChange} />
        <input type="date" name="date" onChange={handleChange} />
        <input type="time" name="time" onChange={handleChange} />
        <input
          name="meetingLink"
          placeholder="Google Meet Link"
          onChange={handleChange}
        />
        <textarea
          name="participants"
          placeholder="Emails comma separated"
          onChange={handleChange}
        />

        <button>Create</button>
      </form>
    </div>
  );
}