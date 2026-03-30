import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { useEffect, useState } from "react";
import { fetchMeetings } from "../../hooks/useMeetings";
import { motion } from "framer-motion";
import { Video } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./MeetingCalendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function MeetingCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchMeetings().then((meetings) => {
      const formatted = meetings.map((m) => ({
        title: m.title,
        start: new Date(`${m.date}T${m.time}`),
        end: new Date(`${m.date}T${m.time}`),
        link: m.meetingLink,
        type: m.type || "general"
      }));
      setEvents(formatted);
    });
  }, []);

  function handleSelect(event) {
    window.open(event.link);
  }

  function eventStyleGetter(event) {
    const colors = {
      general: "#6366f1",
      team: "#10b981",
      client: "#f59e0b",
      urgent: "#ef4444"
    };

    return {
      style: {
        background: colors[event.type],
        borderRadius: "10px",
        border: "none",
        padding: "6px",
        fontSize: "13px"
      }
    };
  }

  return (
    <motion.div
      className="calendar-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="calendar-header">
        <h2>Meeting Calendar</h2>

        <button className="quick-meet-btn">
          <Video size={16} />
          Quick Meet
        </button>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelect}
        eventPropGetter={eventStyleGetter}
        popup
      />
    </motion.div>
  );
}