import { Video, Link2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import CreateMeetingPopup from "./CreateMeetingPopup";
import { useNavigate } from "react-router-dom";
import "./HomeMeet.css";

export default function HomeMeet() {
  const [meetingId, setMeetingId] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();

  function createMeeting() {
    const id = Math.random().toString(36).substring(2, 10);
    setMeetingId(id);
  }

  function joinMeeting() {
    if (!joinCode) return;
    navigate(`/formal/prejoin/${joinCode}`);
  }

  return (
    <div className="meet-container">
      <div className="meet-content">

        {/* LEFT */}
        <motion.div
          className="meet-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Video calls & meetings built for modern teams</h1>

          <p>Fast, secure video collaboration platform</p>

          <div className="meet-actions">
            <button className="new-meet" onClick={createMeeting}>
              <Video size={18} />
              New Meeting
            </button>

            <div className="join-box">
              <Link2 size={16} />
              <input
                placeholder="Enter meeting code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <span onClick={joinMeeting}>Join</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT */}
        <div className="meet-right">
          <div className="video-preview">

            {/* MAIN USER */}
            <div className="main-user"></div>

            {/* SIDE USERS */}
            <div className="mini-user one"></div>
            <div className="mini-user two"></div>
            <div className="mini-user three"></div>

            {/* BOTTOM BAR */}
            <div className="preview-bar">
              <span>Meeting in progress</span>
              <div className="dots"></div>
            </div>

          </div>
        </div>

      </div>

      {/* POPUP */}
      {meetingId && (
        <CreateMeetingPopup
          meetingId={meetingId}
          onClose={() => setMeetingId(null)}
        />
      )}
    </div>
  );
}