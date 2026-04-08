import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import useAnalytics from "../../hooks/useAnalytics";
import { motion } from "framer-motion";
import "./FormalAnalytics.css";

export default function FormalAnalytics() {
  const data = useAnalytics();

  const pieData = [
    { name: "Team", value: 40 },
    { name: "Client", value: 25 },
    { name: "Internal", value: 20 },
    { name: "HR", value: 15 }
  ];

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="analytics-root">

      <h2>Productivity Insights</h2>

      <div className="analytics-grid">

        <motion.div className="chart-card">
          <h3>Meeting Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <Line type="monotone" dataKey="meetings" stroke="#6366f1" strokeWidth={3}/>
              <CartesianGrid stroke="#eee"/>
              <XAxis dataKey="date"/>
              <YAxis/>
              <Tooltip/>
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="chart-card">
          <h3>Productivity Score</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <Line type="monotone" dataKey="productivity" stroke="#10b981" strokeWidth={3}/>
              <CartesianGrid stroke="#eee"/>
              <XAxis dataKey="date"/>
              <YAxis/>
              <Tooltip/>
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="chart-card">
          <h3>Meeting Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="insight-card">
          <h3>AI Insight</h3>
          <p>
            Your productivity increased by 12% this week.
            Best performance on Tuesday.
            Try reducing internal meetings.
          </p>
        </motion.div>

      </div>

    </div>
  );
}