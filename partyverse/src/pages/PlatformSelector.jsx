import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlatformSelector.css";
import formalBg from "../assets/formal-bg.jpg";
import informalBg from "../assets/informal-bg.jpg";

export default function PlatformSelector() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  return (
    <div className="selector-root">

      {/* FORMAL */}
      <div
        className={`selector-half ${active === "formal" ? "active" : ""}`}
        style={{ backgroundImage: `url(${formalBg})` }}
        onMouseEnter={() => setActive("formal")}
        onMouseLeave={() => setActive(null)}
        onClick={() => navigate("/formal/dashboard")}
      >
        <div className="overlay-dark" />
        <div className="content">
          <h1>FormalVerse</h1>
          <p>Manage meetings, performance & internal workflow</p>
          <button>Enter Formal World</button>
        </div>
      </div>

      {/* INFORMAL */}
      <div
        className={`selector-half ${active === "informal" ? "active" : ""}`}
        style={{ backgroundImage: `url(${informalBg})` }}
        onMouseEnter={() => setActive("informal")}
        onMouseLeave={() => setActive(null)}
        onClick={() => navigate("/partyverse")}
      >
        <div className="overlay-dark" />
        <div className="content">
          <h1>EventVerse</h1>
          <p>Explore immersive VR events & social experiences</p>
          <button>Enter Event World</button>
        </div>
      </div>

    </div>
  );
}