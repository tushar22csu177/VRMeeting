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
import PlatformSelector from "./pages/PlatformSelector";
import FormalDashboard from "./components/formal/FormalDashboard";
import ScheduleMeeting from "./components/formal/ScheduleMeeting";
import UpcomingMeetings from "./components/formal/UpcomingMeetings";
import MeetingCalendar from "./components/formal/MeetingCalendar";
import CreateMeeting from "./components/formal/CreateMeeting";
import FormalAnalytics from "./components/formal/FormalAnalytics";
import HomeMeet from "./components/formal/HomeMeet";
import PreJoin from "./components/formal/PreJoin";
import MeetingRoom from "./components/formal/MeetingRoom";
import Rooms from "./pages/Rooms";
import CreateRoom from "./pages/CreateRoom";
import Room3D from "./pages/Room3D";

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
       <Route path="/" element={<PlatformSelector />} />
       <Route path="/partyverse" element={<Landing />} />

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
        
        <Route path="/formal/schedule" element={<ScheduleMeeting />} />

<Route path="/formal/upcoming" element={<UpcomingMeetings />} />
        
        <Route path="/formal/calendar" element={<MeetingCalendar />} />
        {/* FormalVerse */}
        <Route path="/formal/dashboard1" element={<FormalDashboard/>} />

        <Route path="/formal/create-meeting" element={<CreateMeeting />} />

        <Route path="/formal/analytics" element={<FormalAnalytics />} />

        <Route path="/formal/dashboard" element={<HomeMeet />} />

        <Route path="/formal/prejoin/:id" element={<PreJoin />} />
        <Route path="/formal/room/:id" element={<MeetingRoom />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/room/:roomId" element={<Room3D />} />


      </Routes>
    </Router>
  );
}
