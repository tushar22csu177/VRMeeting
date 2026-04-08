import { Copy, Check } from "lucide-react";
import { useState } from "react";
import "./CreateMeetingPopup.css";

export default function CreateMeetingPopup({ meetingId, onClose }) {
  const link = `${window.location.origin}/formal/prejoin/${meetingId}`;
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="popup-overlay">
      <div className="popup-card">

        <div className="popup-header">
          <h3>Your meeting is ready</h3>

          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="popup-sub">
          Share this meeting link with participants
        </p>

        <div className="link-box">
          <span className="link-text">{link}</span>

          <button className="copy-btn" onClick={copyLink}>
            {copied ? <Check size={16}/> : <Copy size={16}/>}
          </button>
        </div>

        {copied && <p className="copied">Link copied</p>}

      </div>
    </div>
  );
}