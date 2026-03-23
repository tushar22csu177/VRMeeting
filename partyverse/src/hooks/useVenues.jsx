// src/hooks/useVenues.jsx
import api from "../lib/api";

export async function fetchVenues() {
  const res = await api.get("/venues");
  return res.data; // { venues }
}
