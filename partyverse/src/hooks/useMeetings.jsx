import api from "../lib/api";

export async function createMeeting(data) {
  const res = await api.post("/meetings", data);
  return res.data.meeting;
}

export async function fetchMeetings() {
  const res = await api.get("/meetings");
  return res.data.meetings;
}