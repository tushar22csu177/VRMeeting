import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AvatarSelect() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 get roomId from URL
  const query = new URLSearchParams(location.search);
  const roomId = query.get("roomId");

  const selectAvatar = (type) => {
    // store avatar choice
    localStorage.setItem("avatarType", type);

    // safety check
    if (!roomId) {
      alert("Room not found!");
      return;
    }

    // go to room with id
    navigate(`/room/${roomId}`);
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#111",
        color: "white",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h1>Choose Your Avatar</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          marginTop: "40px",
        }}
      >
        {/* MALE */}
        <div
          onClick={() => selectAvatar("male")}
          style={{
            cursor: "pointer",
            padding: "20px",
            background: "#222",
            borderRadius: "10px",
          }}
        >
          <img src="/male.png" alt="male" width="150" />
          <h2>Male</h2>
        </div>

        {/* FEMALE */}
        <div
          onClick={() => selectAvatar("female")}
          style={{
            cursor: "pointer",
            padding: "20px",
            background: "#222",
            borderRadius: "10px",
          }}
        >
          <img src="/female.png" alt="female" width="150" />
          <h2>Female</h2>
        </div>
      </div>
    </div>
  );
}