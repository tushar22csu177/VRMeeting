import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms");

        const roomData = Array.isArray(res.data)
          ? res.data
          : res.data.rooms || [];

        setRooms(roomData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleJoin = (roomId) => {
    navigate(`/avatar?roomId=${roomId}`);
  };

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>🌐 Public Rooms</h1>

      {loading && <p>Loading rooms...</p>}

      {!loading && rooms.length === 0 && (
        <p>No rooms available. Create one!</p>
      )}

      <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
        {rooms.map((room) => (
          <div key={room._id} style={{ padding: 20, background: "#222" }}>
            <h3>{room.name}</h3>

            <p>Model: {room.model}</p>
            <p>{room.isPublic ? "Public" : "Private"}</p>

            <button onClick={() => handleJoin(room._id)}>
              🚀 Join Room
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}