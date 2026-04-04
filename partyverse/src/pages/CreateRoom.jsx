// src/pages/CreateRoom.jsx
// ✅ FIXED: redirects through /avatar, handles 401 auth error, correct model key

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

/* ── Particle canvas ──────────────────────────────────── */
function ParticleField() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.35, dy: (Math.random() - 0.5) * 0.35,
      a: Math.random() * 0.4 + 0.15,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,220,255,${p.a})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > c.width) p.dx *= -1;
        if (p.y < 0 || p.y > c.height) p.dy *= -1;
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(100,220,255,${0.07 * (1 - d / 110)})`;
          ctx.lineWidth = 0.4;
          ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ── Room theme data ─────────────────────────────────── */
const THEMES = [
  { value: "jazz_club",  label: "Jazz Club",      emoji: "🎷", desc: "Smooth vibes, ambient lighting",    grad: "linear-gradient(135deg,#1a0533,#3d1166)", accent: "#c084fc" },
  { value: "rooftop",   label: "Rooftop Lounge",  emoji: "🌃", desc: "City skyline, open air",            grad: "linear-gradient(135deg,#0f2027,#203a43)", accent: "#38bdf8" },
  { value: "boardroom", label: "Boardroom",        emoji: "🏢", desc: "Professional, executive suite",     grad: "linear-gradient(135deg,#0a0a0a,#1c1c1e)", accent: "#f59e0b" },
  { value: "zen_garden",label: "Zen Garden",       emoji: "🌿", desc: "Tranquil, nature-inspired",         grad: "linear-gradient(135deg,#052e16,#14532d)", accent: "#4ade80" },
];

const INP = {
  width: "100%", background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12,
  padding: "13px 16px", color: "#f1f5f9", fontSize: 14,
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  transition: "border-color .2s, box-shadow .2s",
};
const LBL = {
  display: "flex", justifyContent: "space-between",
  fontSize: 11, fontWeight: 700, letterSpacing: ".1em",
  textTransform: "uppercase", color: "#94a3b8", marginBottom: 8,
};

/* ── Main ─────────────────────────────────────────────── */
export default function CreateRoom() {
  const navigate = useNavigate();
  const [name,        setName]        = useState("");
  const [model,       setModel]       = useState("jazz_club");
  const [isPublic,    setIsPublic]    = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [capacity,    setCapacity]    = useState(8);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [done,        setDone]        = useState(false);
  const [focused,     setFocused]     = useState(null);

  const theme = THEMES.find(t => t.value === model) || THEMES[0];

  /* Inject Google Font */
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap";
    document.head.appendChild(l);
    return () => document.head.removeChild(l);
  }, []);

  const createRoom = async () => {
    if (!name.trim()) { setError("Please enter a room name."); return; }
    setError(""); setLoading(true);
    try {
      const res = await api.post("/rooms", { name, model, isPublic, capacity });
      const roomId = res.data._id;

      if (!isPublic && inviteEmail) {
        await api.post("/rooms/invite", { roomId, email: inviteEmail });
      }

      setDone(true);
      // ✅ FIXED: go through avatar selection first, then into the room
      setTimeout(() => navigate(`/avatar?roomId=${roomId}`), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (err?.response?.status === 401 || msg.toLowerCase().includes("auth")) {
        setError("You must be logged in to create a room. Please log in first.");
      } else {
        setError(msg || "Failed to create room. Is the server running?");
      }
    } finally {
      setLoading(false);
    }
  };

  /* Success screen */
  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: "#020817", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, fontFamily: "'Sora',sans-serif", position: "relative", overflow: "hidden" }}>
        <ParticleField />
        <div style={{ zIndex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 70, marginBottom: 14 }}>🚀</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: "#64dfdf", margin: 0 }}>Room Created!</h2>
          <p style={{ color: "#64748b", marginTop: 8 }}>Taking you to avatar selection…</p>
          <div style={{ width: 200, height: 4, background: "#1e293b", borderRadius: 2, margin: "20px auto 0", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg,#64dfdf,#c084fc)", borderRadius: 2, animation: "fill 1.5s linear forwards" }} />
          </div>
        </div>
        <style>{`@keyframes fill{from{width:0}to{width:100%}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020817", fontFamily: "'Sora',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative", overflow: "hidden" }}>
      <ParticleField />

      {/* Ambient orbs */}
      <div style={{ position: "fixed", top: "-15%", right: "-8%", width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle,rgba(100,223,223,0.08),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-15%", left: "-8%",  width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(192,132,252,0.06),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Card */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 660, background: "rgba(15,23,42,0.88)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 26, padding: "44px 44px", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(100,223,223,0.1)", border: "1px solid rgba(100,223,223,0.2)", borderRadius: 100, padding: "5px 13px", marginBottom: 18 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#64dfdf", boxShadow: "0 0 6px #64dfdf" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#64dfdf", textTransform: "uppercase" }}>New Space</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, lineHeight: 1.1, background: "linear-gradient(135deg,#f1f5f9,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Create Your<br />
            <span style={{ background: `linear-gradient(135deg,#64dfdf,${theme.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Virtual Room</span>
          </h1>
          <p style={{ margin: "10px 0 0", color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>Set up your immersive 3D space in seconds.</p>
        </div>

        {/* Room name */}
        <div style={{ marginBottom: 24 }}>
          <div style={LBL}><span>Room Name</span></div>
          <input
            placeholder="e.g. Design Sprint · Team Standup"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && createRoom()}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            style={{ ...INP, borderColor: focused === "name" ? "rgba(100,223,223,0.45)" : "rgba(255,255,255,0.09)", boxShadow: focused === "name" ? "0 0 0 3px rgba(100,223,223,0.1)" : "none" }}
          />
        </div>

        {/* Environment */}
        <div style={{ marginBottom: 24 }}>
          <div style={LBL}><span>Environment</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {THEMES.map(t => {
              const active = model === t.value;
              return (
                <div key={t.value} onClick={() => setModel(t.value)} style={{
                  padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                  background: active ? t.grad : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${active ? t.accent : "rgba(255,255,255,0.07)"}`,
                  transition: "all .22s",
                  boxShadow: active ? `0 0 18px ${t.accent}28` : "none",
                  transform: active ? "scale(1.02)" : "scale(1)",
                  position: "relative",
                }}>
                  {active && <div style={{ position: "absolute", top: 10, right: 10, width: 7, height: 7, borderRadius: "50%", background: t.accent, boxShadow: `0 0 5px ${t.accent}` }} />}
                  <div style={{ fontSize: 22, marginBottom: 5 }}>{t.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: active ? "#fff" : "#cbd5e1" }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: active ? "rgba(255,255,255,0.55)" : "#475569", marginTop: 2 }}>{t.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capacity */}
        <div style={{ marginBottom: 24 }}>
          <div style={LBL}><span>Capacity</span><span style={{ fontSize: 18, fontWeight: 800, color: "#64dfdf", fontFamily: "'Courier New',monospace" }}>{capacity}</span></div>
          <input
            type="range" min={2} max={20} value={capacity}
            onChange={e => setCapacity(Number(e.target.value))}
            style={{ width: "100%", height: 5, borderRadius: 3, appearance: "none", cursor: "pointer", outline: "none", background: `linear-gradient(to right,#64dfdf ${((capacity - 2) / 18) * 100}%,#1e293b ${((capacity - 2) / 18) * 100}%)` }}
          />
        </div>

        {/* Visibility */}
        <div style={{ marginBottom: 24 }}>
          <div style={LBL}><span>Visibility</span></div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ v: true, label: "🌐 Public", sub: "Anyone can join" }, { v: false, label: "🔒 Private", sub: "Invite only" }].map(({ v, label, sub }) => (
              <div key={String(v)} onClick={() => setIsPublic(v)} style={{
                flex: 1, padding: "13px 14px", borderRadius: 13, cursor: "pointer", textAlign: "center", transition: "all .2s",
                background: isPublic === v ? "rgba(100,223,223,0.1)" : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${isPublic === v ? "rgba(100,223,223,0.4)" : "rgba(255,255,255,0.07)"}`,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{label}</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite email */}
        {!isPublic && (
          <div style={{ marginBottom: 24 }}>
            <div style={LBL}><span>Invite Email</span><span style={{ fontSize: 10, color: "#475569" }}>Optional</span></div>
            <input
              type="email" placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              style={{ ...INP, borderColor: focused === "email" ? "rgba(100,223,223,0.45)" : "rgba(255,255,255,0.09)", boxShadow: focused === "email" ? "0 0 0 3px rgba(100,223,223,0.1)" : "none" }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, color: "#fca5a5", fontSize: 13, marginBottom: 20 }}>
            ⚠️ {error}
            {error.includes("logged in") && (
              <span onClick={() => navigate("/auth")} style={{ marginLeft: 8, color: "#64dfdf", cursor: "pointer", textDecoration: "underline" }}>Log in →</span>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={createRoom}
          disabled={loading}
          style={{
            width: "100%", padding: "17px", borderRadius: 15, border: "none",
            background: loading ? "rgba(100,223,223,0.3)" : "linear-gradient(135deg,#64dfdf,#48cae4)",
            color: "#020817", fontSize: 15, fontWeight: 800, fontFamily: "inherit",
            letterSpacing: ".04em", cursor: loading ? "not-allowed" : "pointer",
            transition: "all .22s",
            boxShadow: loading ? "none" : "0 8px 28px rgba(100,223,223,0.28)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
        >
          {loading
            ? <><span style={{ width: 16, height: 16, border: "2.5px solid rgba(0,0,0,0.25)", borderTopColor: "#020817", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} /> Launching…</>
            : "✦ Launch Room"
          }
        </button>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <span onClick={() => navigate(-1)} style={{ fontSize: 12, color: "#475569", cursor: "pointer" }}
            onMouseEnter={e => e.target.style.color = "#94a3b8"}
            onMouseLeave={e => e.target.style.color = "#475569"}>
            ← Go back
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #334155; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#64dfdf; cursor:pointer; box-shadow:0 0 8px rgba(100,223,223,0.5); border:3px solid #020817; }
      `}</style>
    </div>
  );
}
