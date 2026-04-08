// src/hooks/useAuth.jsx
import api from "../lib/api";

export async function registerUser({ name, email, password, role }) {
  const res = await api.post("/auth/register", { name, email, password, role });
  return res.data; // { user }
}

export async function loginUser({ email, password }) {
  const res = await api.post("/auth/login", { email, password });
  return res.data; // { user }
}

export async function fetchCurrentUser() {
  const res = await api.get("/auth/me");
  return res.data; // { user }
}

export async function logoutUser() {
  await api.post("/auth/logout");
}
