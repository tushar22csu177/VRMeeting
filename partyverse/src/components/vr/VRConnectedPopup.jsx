/* src/components/vr/VRConnectedPopup.jsx
   ─────────────────────────────────────────
   Animated popup that appears when a VR headset connects/disconnects.
   Auto-dismisses after 4 s. Can also be manually closed.
*/

import React, { useEffect, useRef } from "react";

export default function VRConnectedPopup({ visible, onClose }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(onClose, 4000);
    }
    return () => clearTimeout(timerRef.current);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop blur layer */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: "none",
        }}
      />

      {/* Popup card */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          fontFamily: "'DM Sans', system-ui, sans-serif",
          animation: "vrPopupIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        <style>{`
          @keyframes vrPopupIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
          @keyframes vrRingPulse {
            0%,100% { box-shadow: 0 0 0 0 rgba(99,179,237,0.6), 0 0 40px rgba(99,179,237,0.25); }
            50%     { box-shadow: 0 0 0 18px rgba(99,179,237,0), 0 0 60px rgba(99,179,237,0.4); }
          }
          @keyframes vrIconFloat {
            0%,100% { transform: translateY(0); }
            50%     { transform: translateY(-6px); }
          }
          @keyframes vrProgressBar {
            from { width: 100%; }
            to   { width: 0%; }
          }
        `}</style>

        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(13,17,38,0.97) 0%, rgba(20,28,58,0.97) 100%)",
            border: "1px solid rgba(99,179,237,0.45)",
            borderRadius: 24,
            padding: "36px 44px 28px",
            textAlign: "center",
            minWidth: 320,
            backdropFilter: "blur(24px)",
            boxShadow:
              "0 0 0 1px rgba(99,179,237,0.1), 0 32px 80px rgba(0,0,0,0.7)",
            animation: "vrRingPulse 2s ease-in-out infinite",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              background: "none",
              border: "none",
              color: "rgba(99,179,237,0.5)",
              fontSize: 18,
              cursor: "pointer",
              lineHeight: 1,
              padding: "2px 6px",
              borderRadius: 6,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#63b3ed")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(99,179,237,0.5)")
            }
          >
            ✕
          </button>

          {/* VR headset icon */}
          <div
            style={{
              fontSize: 52,
              marginBottom: 14,
              display: "inline-block",
              animation: "vrIconFloat 2.4s ease-in-out infinite",
            }}
          >
            🥽
          </div>

          {/* Status badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(72,199,116,0.15)",
              border: "1px solid rgba(72,199,116,0.4)",
              borderRadius: 50,
              padding: "4px 14px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#48c774",
                boxShadow: "0 0 8px #48c774",
                animation: "vrRingPulse 1s ease-in-out infinite",
              }}
            />
            <span
              style={{ fontSize: 11, fontWeight: 700, color: "#48c774", letterSpacing: "0.08em" }}
            >
              CONNECTED
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#e8f4fd",
              marginBottom: 6,
              letterSpacing: "-0.01em",
            }}
          >
            VR Headset Connected
          </div>

          {/* Subtext */}
          <p
            style={{
              fontSize: 13,
              color: "rgba(148,187,233,0.75)",
              margin: "0 0 22px",
              lineHeight: 1.55,
            }}
          >
            Your avatar is now synced to your headset.<br />
            Use your hand controllers to move and interact.
          </p>

          {/* Controller legend */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              marginBottom: 22,
            }}
          >
            {[
              { icon: "🤛", label: "Left Hand", hint: "Move / Grab" },
              { icon: "🤜", label: "Right Hand", hint: "Interact" },
            ].map(({ icon, label, hint }) => (
              <div
                key={label}
                style={{
                  background: "rgba(99,179,237,0.08)",
                  border: "1px solid rgba(99,179,237,0.2)",
                  borderRadius: 12,
                  padding: "10px 16px",
                  flex: 1,
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#63b3ed",
                    marginBottom: 2,
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 10, color: "rgba(148,187,233,0.55)" }}>
                  {hint}
                </div>
              </div>
            ))}
          </div>

          {/* Auto-dismiss progress bar */}
          <div
            style={{
              height: 3,
              background: "rgba(99,179,237,0.12)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg,#63b3ed,#90cdf4)",
                borderRadius: 2,
                animation: "vrProgressBar 4s linear forwards",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 10,
              color: "rgba(99,179,237,0.4)",
              letterSpacing: "0.04em",
            }}
          >
            Dismisses automatically
          </div>
        </div>
      </div>
    </>
  );
}
