import FormalSidebar from "./FormalSidebar";
import FormalNavbar from "./FormalNavbar";
import MeetingCalendar from "./MeetingCalendar";
import UpcomingMeetings from "./UpcomingMeetings";
import { motion } from "framer-motion";
import "./FormalDashboard.css";
import useFormalAnalytics from "../../hooks/useFormalAnalytics";

export default function FormalDashboard() {

  const stats = useFormalAnalytics();

  return (
    <div className="formal-root">
      <FormalSidebar />

      <div className="formal-main">
        <FormalNavbar />

        <div className="formal-content">
          
          {/* Stats Cards */}
          <div className="formal-cards">

            <motion.div className="card" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
              <h3>Meetings Today</h3>
              <p>{stats.today}</p>
            </motion.div>

            <motion.div className="card" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
              <h3>Upcoming Meetings</h3>
              <p>{stats.upcoming}</p>
            </motion.div>

            <motion.div className="card" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
              <h3>Total Team</h3>
              <p>{stats.totalTeam}</p>
            </motion.div>

            <motion.div className="card" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
              <h3>Productivity</h3>
              <p>{stats.productivity}%</p>
            </motion.div>

          </div>

          {/* Main Sections */}
          <div className="formal-sections">
            <motion.div className="calendar" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}>
              <MeetingCalendar />
            </motion.div>

            <motion.div className="upcoming" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}>
              <UpcomingMeetings />
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}