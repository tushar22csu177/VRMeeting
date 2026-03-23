// partyverse/src/hooks/useEvents.jsx
import api from "../lib/api";

// LIST – all public events
export async function fetchEvents() {
  const res = await api.get("/events");
  return res.data.events;
}

// SINGLE EVENT
export async function fetchEventById(id) {
  const res = await api.get(`/events/${id}`);
  return res.data.event;
}

// LIST – events hosted by logged-in user
export async function fetchMyEvents() {
  const res = await api.get("/events/my");
  return res.data.events;
}

// CREATE EVENT (with optional file)
export async function createEvent(data) {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  }

  const res = await api.post("/events", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.event;
}

// UPDATE EVENT (host only)
export async function updateEvent(id, data) {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  }

  const res = await api.put(`/events/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.event;
}

// DELETE single EVENT (host only)
export async function deleteEvent(id) {
  const res = await api.delete(`/events/${id}`);
  return res.data;
}

// ❗ NEW: DELETE all past events of current user
export async function deletePastEvents() {
  const res = await api.delete("/events/cleanup/past");
  return res.data;
}
