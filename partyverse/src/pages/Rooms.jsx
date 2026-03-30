// src/pages/Rooms.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Rooms() {
  const [rooms, setRooms] = useState([]); // ✅ MUST be array
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* ===========================
     FETCH ROOMS
  =========================== */
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms");

        console.log("ROOM API:", res.data);

        // ✅ SAFE FIX FOR ALL CASES
        const roomData = Array.isArray(res.data)
          ? res.data
          : res.data.rooms || [];

        setRooms(roomData);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  /* ===========================
     JOIN ROOM
  =========================== */
  const handleJoin = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  /* ===========================
     UI
  =========================== */
  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>🌐 Public Rooms</h1>

      {loading && <p>Loading rooms...</p>}

      {!loading && rooms.length === 0 && (
        <p>No rooms available. Create one!</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {rooms.map((room) => (
          <div
            key={room._id}
            style={{
              padding: "20px",
              borderRadius: "12px",
              background: "#222",
              boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            }}
          >
            <h3>{room.name}</h3>

            <p>
              Model: <strong>{room.model}</strong>
            </p>

            <p>
              Type:{" "}
              <strong>
                {room.isPublic ? "Public" : "Private"}
              </strong>
            </p>

            <button
              onClick={() => handleJoin(room._id)}
              style={{
                marginTop: "10px",
                padding: "10px",
                width: "100%",
                borderRadius: "8px",
                background: "#4cafef",
                border: "none",
                cursor: "pointer",
                color: "white",
                fontWeight: "bold",
              }}
            >
              🚀 Join Room
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}