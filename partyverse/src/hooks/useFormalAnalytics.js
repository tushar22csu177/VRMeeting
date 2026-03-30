import { useEffect, useState } from "react";
import { fetchMeetings } from "./useMeetings";

export default function useFormalAnalytics() {
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    productivity: 0,
    totalTeam: 12
  });

  useEffect(() => {
    fetchMeetings().then((meetings) => {
      const today = new Date().toISOString().split("T")[0];

      const todayMeetings = meetings.filter(m => m.date === today);
      const upcoming = meetings.length;

      const productivity = Math.min(100, upcoming * 8);

      setStats({
        today: todayMeetings.length,
        upcoming,
        productivity,
        totalTeam: 12
      });
    });
  }, []);

  return stats;
}