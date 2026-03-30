import { useEffect, useState } from "react";
import { fetchMeetings } from "./useMeetings";

export default function useAnalytics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchMeetings().then((meetings) => {
      const grouped = {};

      meetings.forEach((m) => {
        grouped[m.date] = (grouped[m.date] || 0) + 1;
      });

      const formatted = Object.keys(grouped).map((d) => ({
        date: d,
        meetings: grouped[d],
        productivity: Math.min(100, grouped[d] * 10)
      }));

      setData(formatted);
    });
  }, []);

  return data;
}