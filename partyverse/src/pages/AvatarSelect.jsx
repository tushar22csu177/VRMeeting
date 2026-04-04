// src/pages/AvatarSelect.jsx
// Luxury jazz-club aesthetic — animated avatar selection before entering the room

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/* ── Animated particle canvas ─────────────────────── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const N = 60;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.6 + 0.3,
      dx: (Math.random() - 0.5) * 0.28, dy: (Math.random() - 0.5) * 0.28,
      a: Math.random() * 0.35 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,148,26,${p.a})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > c.width) p.dx *= -1;
        if (p.y < 0 || p.y > c.height) p.dy *= -1;
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(200,148,26,${0.06 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

/* ── Procedural avatar SVG silhouettes ─────────────── */
function MaleSilhouette({ highlighted }) {
  return (
    <svg viewBox="0 0 120 220" width="120" height="220" style={{ filter: highlighted ? "drop-shadow(0 0 20px rgba(200,148,26,0.8))" : "drop-shadow(0 4px 16px rgba(0,0,0,0.7))", transition: "filter 0.3s" }}>
      {/* Head */}
      <ellipse cx="60" cy="32" rx="22" ry="24" fill="#c8941a" />
      {/* Hair */}
      <ellipse cx="60" cy="14" rx="22" ry="12" fill="#4a2800" />
      {/* Neck */}
      <rect x="53" y="52" width="14" height="12" rx="4" fill="#c8941a" />
      {/* Suit body */}
      <path d="M25 64 Q60 58 95 64 L100 145 Q60 155 20 145 Z" fill="#1a1a2e" />
      {/* Shirt / tie */}
      <path d="M55 64 L60 68 L65 64 L62 120 L58 120 Z" fill="#f5c880" />
      {/* Lapels */}
      <path d="M55 64 L38 80 L52 90 L60 68 Z" fill="#252540" />
      <path d="M65 64 L82 80 L68 90 L60 68 Z" fill="#252540" />
      {/* Left arm */}
      <path d="M25 70 L10 130 L22 133 L33 78 Z" fill="#1a1a2e" />
      {/* Right arm */}
      <path d="M95 70 L110 130 L98 133 L87 78 Z" fill="#1a1a2e" />
      {/* Hands */}
      <ellipse cx="16" cy="133" rx="8" ry="9" fill="#c8941a" />
      <ellipse cx="104" cy="133" rx="8" ry="9" fill="#c8941a" />
      {/* Trousers */}
      <path d="M30 143 L42 210 L58 210 L60 155 L62 210 L78 210 L90 143 Z" fill="#111128" />
      {/* Shoes */}
      <ellipse cx="46" cy="212" rx="14" ry="7" fill="#0a0a16" />
      <ellipse cx="74" cy="212" rx="14" ry="7" fill="#0a0a16" />
      {/* Gold cufflinks */}
      <circle cx="16" cy="128" r="3" fill="#f5c880" />
      <circle cx="104" cy="128" r="3" fill="#f5c880" />
      {/* Eyes */}
      <ellipse cx="53" cy="31" rx="4" ry="4.5" fill="#fff" />
      <ellipse cx="67" cy="31" rx="4" ry="4.5" fill="#fff" />
      <circle cx="54" cy="32" r="2.5" fill="#1a0a00" />
      <circle cx="68" cy="32" r="2.5" fill="#1a0a00" />
      {/* Smile */}
      <path d="M52 44 Q60 50 68 44" stroke="#7a4a10" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function FemaleSilhouette({ highlighted }) {
  return (
    <svg viewBox="0 0 120 220" width="120" height="220" style={{ filter: highlighted ? "drop-shadow(0 0 20px rgba(200,100,150,0.8))" : "drop-shadow(0 4px 16px rgba(0,0,0,0.7))", transition: "filter 0.3s" }}>
      {/* Hair back */}
      <ellipse cx="60" cy="28" rx="26" ry="32" fill="#2a1200" />
      {/* Head */}
      <ellipse cx="60" cy="30" rx="20" ry="22" fill="#d4936a" />
      {/* Hair front */}
      <path d="M40 18 Q60 8 80 18 Q82 36 78 28 Q60 22 42 28 Z" fill="#3a1800" />
      {/* Long hair sides */}
      <path d="M40 30 Q32 60 36 90 L44 88 Q42 60 44 32 Z" fill="#2a1200" />
      <path d="M80 30 Q88 60 84 90 L76 88 Q78 60 76 32 Z" fill="#2a1200" />
      {/* Neck */}
      <rect x="54" y="49" width="12" height="11" rx="4" fill="#d4936a" />
      {/* Evening gown body */}
      <path d="M28 60 Q60 52 92 60 L96 140 Q60 150 24 140 Z" fill="#8b1a4a" />
      {/* Gown skirt flare */}
      <path d="M24 138 L14 210 L46 210 L60 175 L74 210 L106 210 L96 138 Q60 150 24 138 Z" fill="#7a1540" />
      {/* Neckline */}
      <path d="M48 60 Q60 72 72 60" stroke="#6a1030" strokeWidth="3" fill="none" />
      {/* Gold necklace */}
      <path d="M48 64 Q60 76 72 64" stroke="#f5c880" strokeWidth="1.5" fill="none" />
      <circle cx="60" cy="74" r="3" fill="#f5c880" />
      {/* Left arm */}
      <path d="M28 65 L12 118 L23 122 L36 72 Z" fill="#8b1a4a" />
      {/* Right arm */}
      <path d="M92 65 L108 118 L97 122 L84 72 Z" fill="#8b1a4a" />
      {/* Hands */}
      <ellipse cx="17" cy="123" rx="7" ry="8" fill="#d4936a" />
      <ellipse cx="103" cy="123" rx="7" ry="8" fill="#d4936a" />
      {/* Shoes peeping */}
      <ellipse cx="46" cy="212" rx="12" ry="6" fill="#f5c880" />
      <ellipse cx="74" cy="212" rx="12" ry="6" fill="#f5c880" />
      {/* Sequin dots on gown */}
      {[[40,85],[55,75],[70,90],[48,110],[72,105],[60,130],[35,120],[85,115]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="#f5c880" opacity="0.6" />
      ))}
      {/* Eyes */}
      <ellipse cx="53" cy="28" rx="4" ry="4.5" fill="#fff" />
      <ellipse cx="67" cy="28" rx="4" ry="4.5" fill="#fff" />
      <circle cx="54" cy="29" r="2.5" fill="#1a0a00" />
      <circle cx="68" cy="29" r="2.5" fill="#1a0a00" />
      {/* Lashes */}
      <path d="M49 24 L51 21 M53 23 L53 20 M57 23 L58 20" stroke="#1a0a00" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M63 23 L62 20 M67 23 L67 20 M71 24 L69 21" stroke="#1a0a00" strokeWidth="1.2" strokeLinecap="round" />
      {/* Smile */}
      <path d="M52 41 Q60 47 68 41" stroke="#8b4a20" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Earring */}
      <circle cx="40" cy="36" r="2.5" fill="#f5c880" />
      <circle cx="40" cy="42" r="2" fill="#f5c880" />
      <circle cx="80" cy="36" r="2.5" fill="#f5c880" />
      <circle cx="80" cy="42" r="2" fill="#f5c880" />
    </svg>
  );
}

const AVATARS = [
  {
    type: "male",
    label: "The Gentleman",
    tagline: "Sharp suit, sharper instincts",
    traits: ["Classic style", "Commanding presence", "Jazz aficionado"],
    accent: "#c8941a",
    glow: "rgba(200,148,26,0.4)",
    bg: "linear-gradient(160deg,#0d0a02,#1a1200)",
    Silhouette: MaleSilhouette,
  },
  {
    type: "female",
    label: "The Virtuoso",
    tagline: "Elegance is the only beauty that never fades",
    traits: ["Evening glamour", "Graceful movement", "Life of the party"],
    accent: "#e879a0",
    glow: "rgba(232,121,160,0.4)",
    bg: "linear-gradient(160deg,#0d0206,#1a0812)",
    Silhouette: FemaleSilhouette,
  },
];

export default function AvatarSelect() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const query     = new URLSearchParams(location.search);
  const roomId    = query.get("roomId");

  const [selected,  setSelected]  = useState(null);
  const [hovered,   setHovered]   = useState(null);
  const [entering,  setEntering]  = useState(false);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap";
    document.head.appendChild(link);
    setTimeout(() => setMounted(true), 60);
    return () => document.head.removeChild(link);
  }, []);

  const choose = (type) => {
    if (entering) return;
    setSelected(type);
  };

  const confirm = () => {
    if (!selected) return;
    if (!roomId) { alert("Room not found!"); return; }
    setEntering(true);
    localStorage.setItem("avatarType", selected);
    setTimeout(() => navigate(`/room/${roomId}`), 900);
  };

  const av = AVATARS.find(a => a.type === selected);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080401",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <ParticleCanvas />

      {/* Ambient radial glow behind cards */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 700, height: 500, borderRadius: "50%",
        background: "radial-gradient(ellipse,rgba(200,148,26,0.06),transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Decorative horizontal rule */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginBottom: 40, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-20px)", transition: "all 0.7s ease" }}>
        {/* Top ornament */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,transparent,rgba(200,148,26,0.6))" }} />
          <span style={{ fontSize: 22, color: "#c8941a" }}>🎷</span>
          <div style={{ width: 60, height: 1, background: "linear-gradient(270deg,transparent,rgba(200,148,26,0.6))" }} />
        </div>
        <div style={{ fontSize: 11, letterSpacing: "0.35em", color: "#6b4a1a", textTransform: "uppercase", marginBottom: 14 }}>
          Jazz Club · VR
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(32px,5vw,52px)",
          fontWeight: 700,
          color: "#f5c880",
          margin: 0,
          lineHeight: 1.1,
          textShadow: "0 2px 30px rgba(200,148,26,0.3)",
        }}>
          Choose Your<br />
          <em style={{ fontStyle: "italic", color: "#fff5e0" }}>Character</em>
        </h1>
        <p style={{ color: "#6b4a1a", fontSize: 14, marginTop: 12, letterSpacing: "0.05em" }}>
          Select an avatar to enter the room
        </p>
      </div>

      {/* Avatar cards */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", gap: "clamp(16px,3vw,40px)",
        flexWrap: "wrap", justifyContent: "center",
        opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s ease 0.15s",
      }}>
        {AVATARS.map((av, idx) => {
          const isSelected = selected === av.type;
          const isHovered  = hovered === av.type;
          const active     = isSelected || isHovered;
          return (
            <div
              key={av.type}
              onClick={() => choose(av.type)}
              onMouseEnter={() => setHovered(av.type)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: "clamp(200px,28vw,280px)",
                background: av.bg,
                border: `1.5px solid ${isSelected ? av.accent : "rgba(200,148,26,0.12)"}`,
                borderRadius: 24,
                padding: "32px 28px 28px",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.34,1.3,0.64,1)",
                transform: isSelected
                  ? "translateY(-12px) scale(1.04)"
                  : isHovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
                boxShadow: isSelected
                  ? `0 20px 60px ${av.glow}, 0 0 0 1px ${av.accent}40, inset 0 1px 0 ${av.accent}20`
                  : isHovered
                  ? `0 12px 40px ${av.glow}, 0 0 0 1px rgba(200,148,26,0.15)`
                  : "0 4px 20px rgba(0,0,0,0.4)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Shimmer overlay */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: 24,
                background: `radial-gradient(ellipse at 50% 0%, ${av.glow.replace("0.4","0.07")}, transparent 70%)`,
                pointerEvents: "none",
              }} />

              {/* Selected check */}
              {isSelected && (
                <div style={{
                  position: "absolute", top: 16, right: 16,
                  width: 26, height: 26, borderRadius: "50%",
                  background: av.accent, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, color: "#080401", fontWeight: 900,
                  boxShadow: `0 0 12px ${av.glow}`,
                  animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                }}>✓</div>
              )}

              {/* Avatar illustration */}
              <div style={{
                display: "flex", justifyContent: "center",
                marginBottom: 24, position: "relative",
              }}>
                {/* Glow floor */}
                <div style={{
                  position: "absolute", bottom: 0, left: "50%",
                  transform: "translateX(-50%)",
                  width: 100, height: 20, borderRadius: "50%",
                  background: `radial-gradient(ellipse,${active ? av.glow : "rgba(0,0,0,0.3)"},transparent)`,
                  transition: "all 0.3s",
                  filter: "blur(8px)",
                }} />
                <av.Silhouette highlighted={active} />
              </div>

              {/* Name */}
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22, fontWeight: 700,
                color: isSelected ? av.accent : "#f5e0c0",
                marginBottom: 4, textAlign: "center",
                transition: "color 0.3s",
              }}>{av.label}</div>

              {/* Tagline */}
              <div style={{
                fontSize: 12, color: "#6b4a1a",
                textAlign: "center", fontStyle: "italic",
                marginBottom: 20, lineHeight: 1.5,
              }}>{av.tagline}</div>

              {/* Traits */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {av.traits.map((t, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontSize: 12, color: isSelected ? "#f5c880" : "#4a3010",
                    transition: "color 0.3s",
                  }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: isSelected ? av.accent : "#3a2010",
                      flexShrink: 0, transition: "background 0.3s",
                    }} />
                    {t}
                  </div>
                ))}
              </div>

              {/* Bottom select hint */}
              <div style={{
                marginTop: 22,
                padding: "10px 0",
                borderTop: `1px solid ${isSelected ? av.accent + "30" : "rgba(200,148,26,0.08)"}`,
                textAlign: "center",
                fontSize: 11, letterSpacing: "0.12em",
                color: isSelected ? av.accent : "#3a2010",
                textTransform: "uppercase", fontWeight: 600,
                transition: "all 0.3s",
              }}>
                {isSelected ? "✦ Selected" : "Click to choose"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm button */}
      <div style={{
        position: "relative", zIndex: 1, marginTop: 40,
        opacity: mounted ? 1 : 0, transition: "all 0.8s ease 0.3s",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
      }}>
        <button
          onClick={confirm}
          disabled={!selected || entering}
          style={{
            padding: "16px 56px",
            borderRadius: 50,
            border: "none",
            background: selected
              ? entering
                ? "rgba(200,148,26,0.4)"
                : `linear-gradient(135deg, ${av?.accent || "#c8941a"}, #f5c880)`
              : "rgba(255,255,255,0.04)",
            color: selected ? "#080401" : "#3a2010",
            fontSize: 15, fontWeight: 700,
            fontFamily: "'DM Sans', system-ui",
            letterSpacing: "0.08em",
            cursor: selected && !entering ? "pointer" : "not-allowed",
            transition: "all 0.3s",
            boxShadow: selected && !entering
              ? `0 8px 32px ${av?.glow || "rgba(200,148,26,0.4)"}, 0 2px 8px rgba(0,0,0,0.4)`
              : "none",
            transform: selected && !entering ? "scale(1)" : "scale(0.97)",
            display: "flex", alignItems: "center", gap: 10,
            position: "relative", overflow: "hidden",
          }}
          onMouseEnter={e => { if(selected&&!entering) e.currentTarget.style.transform="translateY(-2px) scale(1.02)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; }}
        >
          {entering ? (
            <>
              <span style={{ width: 16, height: 16, border: "2.5px solid rgba(0,0,0,0.3)", borderTopColor: "#080401", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              Entering the room…
            </>
          ) : (
            <>✦ Enter the Jazz Club</>
          )}
        </button>

        {!selected && (
          <p style={{ fontSize: 12, color: "#3a2010", letterSpacing: "0.05em" }}>
            Select a character above to continue
          </p>
        )}

        <div
          onClick={() => navigate(-1)}
          style={{ fontSize: 12, color: "#3a2010", cursor: "pointer", transition: "color 0.2s" }}
          onMouseEnter={e => e.target.style.color = "#6b4a1a"}
          onMouseLeave={e => e.target.style.color = "#3a2010"}
        >
          ← Go back
        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes popIn   { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
