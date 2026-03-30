import { useEffect, useState } from "react";
import { fetchMeetings } from "../../hooks/useMeetings";
import { motion } from "framer-motion";
import { Video, Clock } from "lucide-react";
import "./UpcomingMeetings.css";

export default function UpcomingMeetings() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    fetchMeetings().then(setMeetings);
  }, []);

  function getStatus(date, time) {
    const meetingTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (now > meetingTime) return "ended";

    const diff = (meetingTime - now) / 60000;
    if (diff <= 10) return "live";

    return "upcoming";
  }

  return (
    <div className="upcoming-wrapper">
      <h2>Upcoming Meetings</h2>

      <div className="meeting-list">
        {meetings.map((m, i) => {
          const status = getStatus(m.date, m.time);

          return (
            <motion.div
              key={m._id}
              className={`meeting-card ${status}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="meeting-info">
                <h3>{m.title}</h3>
                <p>
                  <Clock size={14} />
                  {m.date} • {m.time}
                </p>
              </div>

              <div className="meeting-actions">
                {status === "live" && (
                  <span className="live-badge">LIVE</span>
                )}

                <button
                  className="join-btn"
                  onClick={() => window.open(m.meetingLink)}
                >
                  <Video size={16} />
                  Join
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}