import React, { useState } from "react";
import axios from "axios";
import api from "../lib/api";

export default function CreateRoom() {
  const [name, setName] = useState("");
  const [model, setModel] = useState("jazz_club");
  const [isPublic, setIsPublic] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");

  const createRoom = async () => {
    const res = await api.post("/rooms", {
      name,
      model,
      isPublic,
    });

    const roomId = res.data._id;

    if (!isPublic && inviteEmail) {
      await api.post("/rooms/invite", {
        roomId,
        email: inviteEmail,
      });
    }

    window.location = `/room/${roomId}`;
  };

  return (
    <div style={{ padding: 30, color: "white" }}>
      <h1>Create Room</h1>

      <input
        placeholder="Room Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select onChange={(e) => setModel(e.target.value)}>
        <option value="jazz_club">Jazz Club</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={() => setIsPublic(!isPublic)}
        />
        Public Room
      </label>

      {!isPublic && (
        <input
          placeholder="Invite Email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
      )}

      <button onClick={createRoom}>Create</button>
    </div>
  );
}