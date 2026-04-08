import { motion } from "framer-motion";
import {
  Bell,
  Video,
  Search,
  Settings,
  Moon,
  Sun
} from "lucide-react";
import { useState } from "react";
import "./FormalDashboard.css";

export default function FormalNavbar() {
  const [dark, setDark] = useState(false);

  return (
    <motion.div
      className="formal-navbar"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {/* Search */}
      <div className="navbar-search">
        <Search size={18} />
        <input placeholder="Search meetings, team, analytics..." />
      </div>

      {/* Actions */}
      <div className="navbar-actions">

        {/* Quick Join */}
        <button className="join-btn">
          <Video size={16} />
          Join Meeting
        </button>

        {/* Notification */}
        <div className="nav-icon">
          <Bell size={18} />
          <span className="notif-dot"></span>
        </div>

        {/* Theme */}
        <div
          className="nav-icon"
          onClick={() => setDark(!dark)}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </div>

        {/* Settings */}
        <div className="nav-icon">
          <Settings size={18} />
        </div>

        {/* User */}
        <div className="formal-user">T</div>
      </div>
    </motion.div>
  );
}