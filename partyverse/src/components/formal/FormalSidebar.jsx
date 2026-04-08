import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Video,
  Clock,
  BarChart3,
  Users,
  User,
  FolderKanban
} from "lucide-react";
import "./FormalDashboard.css";

export default function FormalSidebar() {
  const menu = [
    { name: "Dashboard", path: "/formal/dashboard", icon: LayoutDashboard },
    { name: "Schedule", path: "/formal/create-meeting", icon: Video },
    { name: "Upcoming", path: "/formal/meetings", icon: Clock },
    { name: "History", path: "/formal/history", icon: FolderKanban },
    { name: "Workspace", path: "/formal/workspace", icon: Users },
    { name: "Analytics", path: "/formal/analytics", icon: BarChart3 },
    { name: "Calendar", path: "/formal/calendar", icon: Calendar },
    { name: "Profile", path: "/formal/profile", icon: User }
  ];

  return (
    <div className="formal-sidebar">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        FormalVerse
      </motion.h2>

      <nav>
        {menu.map((item, index) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}