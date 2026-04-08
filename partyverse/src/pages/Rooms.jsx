// src/pages/Rooms.jsx
// Luxury jazz-club lobby — animated room cards, search, live indicators

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

/* ── Fonts ──────────────────────────────────────────────── */
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap";

/* ── Environment meta ────────────────────────────────────── */
const ENV_META = {
  jazz_club:  { label: "Jazz Club",      emoji: "🎷", color: "#c8941a", bg: "linear-gradient(135deg,#1a0e04,#2e1a06)" },
  rooftop:    { label: "Rooftop Lounge", emoji: "🌃", color: "#38bdf8", bg: "linear-gradient(135deg,#051218,#0a2030)" },
  boardroom:  { label: "Boardroom",      emoji: "🏢", color: "#f59e0b", bg: "linear-gradient(135deg,#0a0a0a,#1a1a1a)" },
  zen_garden: { label: "Zen Garden",     emoji: "🌿", color: "#4ade80", bg: "linear-gradient(135deg,#031008,#081a0e)" },
};
const DEFAULT_ENV = { label: "Room", emoji: "🚪", color: "#c8941a", bg: "linear-gradient(135deg,#1a0e04,#2e1a06)" };

/* ── Animated canvas background ─────────────────────────── */
function SceneBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    // Floating particles
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.22, dy: (Math.random() - 0.5) * 0.22,
      a: Math.random() * 0.3 + 0.08,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      // Connection lines
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(200,148,26,${0.055 * (1 - d / 110)})`;
          ctx.lineWidth = 0.4;
          ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
      // Dots
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,148,26,${p.a})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > c.width) p.dx *= -1;
        if (p.y < 0 || p.y > c.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

/* ── Animated live dot ───────────────────────────────────── */
function LiveDot({ color = "#4ade80" }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10, flexShrink: 0 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: color, opacity: 0.5,
        animation: "ripple 1.8s ease-out infinite",
      }} />
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "block" }} />
    </span>
  );
}

/* ── Room card ───────────────────────────────────────────── */
function RoomCard({ room, index, onJoin }) {
  const [hovered, setHovered] = useState(false);
  const [joining, setJoining] = useState(false);
  const env = ENV_META[room.model] || DEFAULT_ENV;

  // Fake live player count for visual richness (replace with real socket data if available)
  const fakeCount = useRef(Math.floor(Math.random() * 6) + 1);
  const isLive = fakeCount.current > 0;

  const handleJoin = async () => {
    setJoining(true);
    await onJoin(room._id);
  };

  const created = room.createdAt
    ? new Date(room.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? env.bg : "rgba(12,8,2,0.85)",
        border: `1.5px solid ${hovered ? env.color + "55" : "rgba(200,148,26,0.1)"}`,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.34,1.1,0.64,1)",
        transform: hovered ? "translateY(-6px) scale(1.015)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${env.color}22, 0 0 40px ${env.color}12`
          : "0 4px 24px rgba(0,0,0,0.4)",
        animation: `cardReveal 0.5s ease both`,
        animationDelay: `${index * 0.07}s`,
        cursor: "pointer",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Top accent strip */}
      <div style={{
        height: 3,
        background: hovered
          ? `linear-gradient(90deg, ${env.color}, ${env.color}88, transparent)`
          : `linear-gradient(90deg, ${env.color}44, transparent)`,
        transition: "all 0.3s",
      }} />

      {/* Card body */}
      <div style={{ padding: "22px 24px 20px" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          {/* Env icon badge */}
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `${env.color}18`,
            border: `1px solid ${env.color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, flexShrink: 0,
            transition: "all 0.3s",
            transform: hovered ? "scale(1.08) rotate(-4deg)" : "scale(1) rotate(0)",
          }}>{env.emoji}</div>

          {/* Status badges */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {/* Public / Private */}
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              background: room.isPublic ? "rgba(74,222,128,0.1)" : "rgba(251,191,36,0.1)",
              border: `1px solid ${room.isPublic ? "rgba(74,222,128,0.25)" : "rgba(251,191,36,0.25)"}`,
              borderRadius: 20, padding: "3px 10px",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              color: room.isPublic ? "#4ade80" : "#fbbf24",
              textTransform: "uppercase",
            }}>
              {room.isPublic ? "🌐 Public" : "🔒 Private"}
            </div>

            {/* Live indicator */}
            
          </div>
        </div>

        {/* Room name */}
        <h3 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 20, fontWeight: 700,
          color: hovered ? "#fff5e0" : "#f5c880",
          margin: "0 0 6px",
          lineHeight: 1.2,
          transition: "color 0.2s",
          letterSpacing: "-0.01em",
        }}>{room.name || "Unnamed Room"}</h3>

        {/* Environment label */}
        <div style={{
          fontSize: 12, color: env.color,
          fontWeight: 500, marginBottom: 16,
          display: "flex", alignItems: "center", gap: 5,
          opacity: 0.85,
        }}>
          <span style={{
            display: "inline-block", width: 5, height: 5, borderRadius: "50%",
            background: env.color,
          }} />
          {env.label}
          {created && (
            <span style={{ color: "#3a2410", marginLeft: 8, fontWeight: 400 }}>· {created}</span>
          )}
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: `linear-gradient(90deg, ${env.color}22, transparent)`,
          marginBottom: 18,
        }} />

        {/* Host info */}
        {room.host && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: `${env.color}25`,
              border: `1px solid ${env.color}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              color: env.color,
              flexShrink: 0,
            }}>
              {(room.host?.username || room.host?.email || "H").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#4a3010", lineHeight: 1 }}>Hosted by</div>
              <div style={{ fontSize: 12, color: "#8b6030", fontWeight: 600 }}>
                {room.host?.username || room.host?.email || "Host"}
              </div>
            </div>
          </div>
        )}

        {/* Join button */}
        <button
          onClick={handleJoin}
          disabled={joining}
          style={{
            width: "100%", padding: "11px 0",
            borderRadius: 12, border: "none",
            background: joining
              ? `${env.color}30`
              : hovered
              ? `linear-gradient(135deg,${env.color},${env.color}cc)`
              : `${env.color}18`,
            color: hovered ? "#080401" : env.color,
            fontSize: 13, fontWeight: 700,
            fontFamily: "'DM Sans',system-ui",
            letterSpacing: "0.06em",
            cursor: joining ? "not-allowed" : "pointer",
            transition: "all 0.25s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            border: `1px solid ${hovered ? "transparent" : env.color + "30"}`,
          }}
        >
          {joining ? (
            <>
              <span style={{
                width: 14, height: 14, border: "2px solid transparent",
                borderTopColor: env.color, borderRadius: "50%",
                display: "inline-block", animation: "spin 0.7s linear infinite",
              }} />
              Joining…
            </>
          ) : (
            <>🚀 Join Room</>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyState({ onCreateRoom }) {
  return (
    <div style={{
      gridColumn: "1 / -1",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "72px 40px", textAlign: "center",
      animation: "cardReveal 0.6s ease both",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "rgba(200,148,26,0.08)",
        border: "1px solid rgba(200,148,26,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, marginBottom: 24,
        animation: "breathe 3s ease-in-out infinite",
      }}>🎷</div>
      <h3 style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: 24, color: "#f5c880", margin: "0 0 10px",
      }}>No rooms yet</h3>
      <p style={{ fontSize: 13, color: "#4a3010", marginBottom: 28, lineHeight: 1.7 }}>
        The club is quiet tonight.<br />Be the first to open a room.
      </p>
      <button onClick={onCreateRoom} style={{
        padding: "12px 32px", borderRadius: 50, border: "none",
        background: "linear-gradient(135deg,#c8941a,#f5c880)",
        color: "#080401", fontSize: 13, fontWeight: 700,
        fontFamily: "'DM Sans',system-ui", cursor: "pointer",
        letterSpacing: "0.06em",
        boxShadow: "0 6px 24px rgba(200,148,26,0.35)",
      }}>
        ✦ Create a Room
      </button>
    </div>
  );
}

/* ── Skeleton loader card ────────────────────────────────── */
function SkeletonCard({ index }) {
  return (
    <div style={{
      background: "rgba(12,8,2,0.7)",
      border: "1.5px solid rgba(200,148,26,0.07)",
      borderRadius: 20, overflow: "hidden",
      animation: `cardReveal 0.4s ease both`,
      animationDelay: `${index * 0.06}s`,
    }}>
      <div style={{ height: 3, background: "rgba(200,148,26,0.08)" }} />
      <div style={{ padding: "22px 24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, ...shimmer }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ width: 72, height: 22, borderRadius: 20, ...shimmer }} />
            <div style={{ width: 88, height: 22, borderRadius: 20, ...shimmer }} />
          </div>
        </div>
        <div style={{ width: "70%", height: 22, borderRadius: 6, marginBottom: 10, ...shimmer }} />
        <div style={{ width: "40%", height: 16, borderRadius: 6, marginBottom: 20, ...shimmer }} />
        <div style={{ height: 1, background: "rgba(200,148,26,0.06)", marginBottom: 18 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", ...shimmer }} />
          <div style={{ width: "50%", height: 14, borderRadius: 4, ...shimmer }} />
        </div>
        <div style={{ width: "100%", height: 42, borderRadius: 12, ...shimmer }} />
      </div>
    </div>
  );
}

const shimmer = {
  background: "linear-gradient(90deg,rgba(200,148,26,0.06) 25%,rgba(200,148,26,0.12) 50%,rgba(200,148,26,0.06) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
};

/* ── Main ─────────────────────────────────────────────────── */
export default function Rooms() {
  const navigate = useNavigate();

  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");   // all | public | private
  const [sort,    setSort]    = useState("newest"); // newest | name
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = FONT_LINK;
    document.head.appendChild(link);
    setTimeout(() => setMounted(true), 60);
    return () => document.head.removeChild(link);
  }, []);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/rooms");
      const data = Array.isArray(res.data) ? res.data : res.data.rooms || [];
      setRooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleJoin = useCallback((roomId) => {
    navigate(`/avatar?roomId=${roomId}`);
  }, [navigate]);

  // Filter + search + sort
  const visible = rooms
    .filter(r => {
      if (filter === "public"  && !r.isPublic) return false;
      if (filter === "private" &&  r.isPublic) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (r.name || "").toLowerCase().includes(q)
          || (ENV_META[r.model]?.label || "").toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === "name") return (a.name || "").localeCompare(b.name || "");
      // newest first
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const publicCount  = rooms.filter(r => r.isPublic).length;
  const privateCount = rooms.filter(r => !r.isPublic).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080401",
      fontFamily: "'DM Sans',system-ui,sans-serif",
      position: "relative",
      overflow: "hidden auto",
    }}>
      <SceneBackground />

      {/* Ambient glow orbs */}
      <div style={{ position: "fixed", top: "-15%", right: "-8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(200,148,26,0.07),transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", left: "-10%",  width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(200,80,26,0.05),transparent 70%)",  pointerEvents: "none", zIndex: 0 }} />

      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 1100, margin: "0 auto",
        padding: "48px 24px 80px",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "none" : "translateY(16px)",
        transition: "all 0.6s ease",
      }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 40 }}>
          {/* Ornament */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(200,148,26,0.35))" }} />
            <span style={{ fontSize: 20, color: "#c8941a" }}>🎷</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(270deg,transparent,rgba(200,148,26,0.35))" }} />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.35em", color: "#4a3010", textTransform: "uppercase", marginBottom: 8 }}>
                VR Jazz Club
              </div>
              <h1 style={{
                fontFamily: "'Playfair Display',Georgia,serif",
                fontSize: "clamp(32px,5vw,48px)", fontWeight: 700,
                color: "#f5c880", margin: 0, lineHeight: 1.1,
                textShadow: "0 2px 30px rgba(200,148,26,0.25)",
              }}>
                Rooms
              </h1>
              {!loading && (
                <div style={{ fontSize: 13, color: "#4a3010", marginTop: 8, display: "flex", gap: 16 }}>
                  <span>{rooms.length} room{rooms.length !== 1 ? "s" : ""} total</span>
                  {publicCount > 0  && <span style={{ color: "#4ade80" }}>· {publicCount} public</span>}
                  {privateCount > 0 && <span style={{ color: "#fbbf24" }}>· {privateCount} private</span>}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={fetchRooms}
                style={{
                  background: "rgba(200,148,26,0.08)", border: "1px solid rgba(200,148,26,0.2)",
                  borderRadius: 10, padding: "9px 16px", color: "#c8941a",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Sans',system-ui", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,148,26,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(200,148,26,0.08)"; }}
              >
                ↻ Refresh
              </button>
              <button
                onClick={() => navigate("/create-room")}
                style={{
                  background: "linear-gradient(135deg,#c8941a,#f5c880)",
                  border: "none", borderRadius: 10, padding: "9px 20px",
                  color: "#080401", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'DM Sans',system-ui", letterSpacing: "0.05em",
                  boxShadow: "0 4px 18px rgba(200,148,26,0.35)",
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "transform 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px) scale(1.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
              >
                ✦ Create Room
              </button>
            </div>
          </div>
        </div>

        {/* ── SEARCH + FILTERS ── */}
        <div style={{
          display: "flex", gap: 10, flexWrap: "wrap",
          marginBottom: 32, alignItems: "center",
        }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              fontSize: 14, color: "#4a3010", pointerEvents: "none",
            }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search rooms…"
              style={{
                width: "100%", background: "rgba(12,8,2,0.85)",
                border: "1px solid rgba(200,148,26,0.15)", borderRadius: 10,
                padding: "10px 14px 10px 38px", color: "#f5c880",
                fontSize: 13, fontFamily: "'DM Sans',system-ui",
                outline: "none", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(200,148,26,0.45)"}
              onBlur={e  => e.target.style.borderColor = "rgba(200,148,26,0.15)"}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { key: "all",     label: "All" },
              { key: "public",  label: "🌐 Public" },
              { key: "private", label: "🔒 Private" },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                background: filter === f.key ? "rgba(200,148,26,0.18)" : "rgba(12,8,2,0.7)",
                border: `1px solid ${filter === f.key ? "rgba(200,148,26,0.45)" : "rgba(200,148,26,0.12)"}`,
                borderRadius: 8, padding: "8px 14px",
                color: filter === f.key ? "#f5c880" : "#4a3010",
                fontSize: 12, fontWeight: filter === f.key ? 700 : 400,
                cursor: "pointer", transition: "all 0.18s",
                fontFamily: "'DM Sans',system-ui",
              }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              background: "rgba(12,8,2,0.85)", border: "1px solid rgba(200,148,26,0.15)",
              borderRadius: 8, padding: "8px 12px", color: "#c8941a",
              fontSize: 12, fontFamily: "'DM Sans',system-ui",
              outline: "none", cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23c8941a'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
              paddingRight: 28,
            }}
          >
            <option value="newest">Newest first</option>
            <option value="name">A → Z</option>
          </select>
        </div>

        {/* ── ROOM GRID ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
          gap: 20,
        }}>
          {loading
            ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} index={i} />)
            : visible.length === 0
            ? <EmptyState onCreateRoom={() => navigate("/create-room")} />
            : visible.map((room, i) => (
                <RoomCard key={room._id} room={room} index={i} onJoin={handleJoin} />
              ))
          }
        </div>

        {/* ── BOTTOM NAV ── */}
        <div style={{
          marginTop: 56, display: "flex", justifyContent: "center",
          gap: 12, flexWrap: "wrap",
        }}>
          {[
            { label: "← Home",       path: "/partyverse" },
            { label: "My Events",     path: "/dashboard/events" },
            { label: "+ Create Room", path: "/create-room", accent: true },
          ].map(({ label, path, accent }) => (
            <button key={path} onClick={() => navigate(path)} style={{
              background: accent ? "linear-gradient(135deg,#c8941a,#f5c880)" : "rgba(12,8,2,0.7)",
              border: accent ? "none" : "1px solid rgba(200,148,26,0.15)",
              borderRadius: 10, padding: "10px 22px",
              color: accent ? "#080401" : "#6b4a1a",
              fontSize: 12, fontWeight: accent ? 700 : 500,
              cursor: "pointer", fontFamily: "'DM Sans',system-ui",
              transition: "all 0.2s",
              boxShadow: accent ? "0 4px 18px rgba(200,148,26,0.3)" : "none",
            }}
            onMouseEnter={e => { if (!accent) e.currentTarget.style.color = "#c8941a"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { if (!accent) e.currentTarget.style.color = "#6b4a1a"; e.currentTarget.style.transform = "none"; }}
            >{label}</button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes cardReveal  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer     { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        @keyframes ripple      { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.8);opacity:0} }
        @keyframes breathe     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        input::placeholder     { color:#2a1a08; }
      `}</style>
    </div>
  );
}
