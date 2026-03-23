// partyverse/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Events from "./pages/Events";
import Venues from "./pages/Venues";
import CreateEvent from "./pages/CreateEvent";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import EventDetails from "./pages/EventDetails";
import EventDashboard from "./pages/EventDashboard";

function NotFound() {
  return (
    <div
      style={{
        color: "#fff",
        textAlign: "center",
        marginTop: 100,
        fontSize: 32,
      }}
    >
      Not Found
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Landing / Home */}
        <Route path="/" element={<Landing />} />

        {/* Events list + details */}
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />

        {/* Host event */}
        <Route path="/events/new" element={<CreateEvent />} />

        {/* Dashboard – hosted events */}
        <Route path="/dashboard/events" element={<EventDashboard />} />

        {/* Venues */}
        <Route path="/venues" element={<Venues />} />

        {/* Authentication */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/register" element={<SignUp />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
