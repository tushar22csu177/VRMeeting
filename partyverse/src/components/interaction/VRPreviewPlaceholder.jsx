// src/components/VRPreview.jsx
import React from "react";

export default function VRPreview() {
  // For now just a placeholder - you can later integrate real WebGL/Three.js etc.
  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "16px",
        border: "1px solid #444",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        background:
          "radial-gradient(circle at top, #533dfb 0, #11001f 40%, #000 100%)"
      }}
    >
      360° / VR Preview Coming Soon
    </div>
  );
}
