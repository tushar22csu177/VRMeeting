// src/pages/Room3D.jsx

import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, useProgress, useGLTF } from "@react-three/drei";
import socket from "../lib/socket";
import Avatar from "../components/Avatar";
import { useParams } from "react-router-dom";
import * as THREE from "three";

/* ================= LOADER ================= */
function Loader() {
  const { progress } = useProgress();
  return (
    <Html fullscreen>
      <div style={{ color: "white" }}>
        Loading {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

/* ================= MODEL ================= */
function Model({ registerSeats, onSeatClick }) {
  const { scene } = useGLTF("/models/Jazz_Club.glb");

  useEffect(() => {
    const seats = {};

    scene.traverse((child) => {
      if (
        child.isMesh &&
        (child.name.toLowerCase().includes("chair") ||
          child.name.toLowerCase().includes("seat"))
      ) {
        seats[child.name] = child;
      }
    });

    registerSeats(seats);
  }, [scene]);

  return (
    <primitive
      object={scene}
      onPointerDown={(e) => {
        e.stopPropagation();

        if (e.object.name.toLowerCase().includes("chair")) {
          onSeatClick(e.object.name);
        }
      }}
    />
  );
}

/* ================= FPS CONTROLS ================= */
function FPSControls({ enabled }) {
  const { camera } = useThree();

  const keys = useRef({});
  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    const down = (e) => (keys.current[e.key.toLowerCase()] = true);
    const up = (e) => (keys.current[e.key.toLowerCase()] = false);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const move = (e) => {
      if (!enabled) return;

      yaw.current -= e.movementX * 0.002;
      pitch.current -= e.movementY * 0.002;

      pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current));
    };

    document.addEventListener("mousemove", move);
    return () => document.removeEventListener("mousemove", move);
  }, [enabled]);

  useFrame(() => {
    if (!enabled) return;

    const speed = 0.08;

    const forward = new THREE.Vector3(
      Math.sin(yaw.current),
      0,
      Math.cos(yaw.current)
    );

    const right = new THREE.Vector3(
      Math.sin(yaw.current - Math.PI / 2),
      0,
      Math.cos(yaw.current - Math.PI / 2)
    );

    if (keys.current["w"]) camera.position.addScaledVector(forward, -speed);
    if (keys.current["s"]) camera.position.addScaledVector(forward, speed);
    if (keys.current["a"]) camera.position.addScaledVector(right, -speed);
    if (keys.current["d"]) camera.position.addScaledVector(right, speed);

    camera.rotation.set(pitch.current, yaw.current, 0);
  });

  return null;
}

/* ================= CAMERA LOCK ================= */
function CameraSeat({ seatObj }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!seatObj) return;

    const anchor = getSeatAnchor(seatObj);

    camera.position.set(anchor.position[0], anchor.position[1] + 1.1, anchor.position[2]);
  }, [seatObj]);

  return null;
}

/* ================= 🔥 ANCHOR FUNCTION ================= */
function getSeatAnchor(obj) {
  const box = new THREE.Box3().setFromObject(obj);

  const center = new THREE.Vector3();
  box.getCenter(center);

  const size = new THREE.Vector3();
  box.getSize(size);

  const quat = new THREE.Quaternion();
  obj.getWorldQuaternion(quat);

  const rot = new THREE.Euler().setFromQuaternion(quat);

  return {
    // 🎯 PERFECT SEAT POSITION
    position: [
      center.x,
      box.max.y - size.y * 0.35, // seat height area
      center.z
    ],

    // 🎯 FACE CORRECT DIRECTION
    rotation: [0, rot.y + Math.PI, 0]
  };
}

/* ================= MAIN ================= */
export default function Room3D() {
  const { roomId } = useParams();

  const [seatMap, setSeatMap] = useState({});
  const [seatObjects, setSeatObjects] = useState({});
  const [mySeat, setMySeat] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    socket.emit("joinRoom", { roomId, userId });

    socket.on("seatState", setSeatMap);
    socket.on("seatUpdate", setSeatMap);

    return () => {
      socket.off("seatState");
      socket.off("seatUpdate");
    };
  }, []);

  const handleSeatClick = (seatName) => {
    if (seatMap[seatName]) return;

    socket.emit("takeSeat", { roomId, seatName, userId });
    setMySeat(seatName);
  };

  return (
    <Canvas camera={{ position: [0, 2, 5] }}>
      <ambientLight />
      <directionalLight position={[5, 5, 5]} />

      <Suspense fallback={<Loader />}>
        <Model registerSeats={setSeatObjects} onSeatClick={handleSeatClick} />

        <FPSControls enabled={!mySeat} />
        <CameraSeat seatObj={seatObjects[mySeat]} />

        {/* AVATARS */}
        {Object.entries(seatMap).map(([seatName, uid]) => {
          const obj = seatObjects[seatName];
          if (!obj) return null;

          const anchor = getSeatAnchor(obj);

          return (
            <Avatar
              key={uid}
              position={anchor.position}
              rotation={anchor.rotation}
              avatarType="female"
              isMe={uid === userId}
            />
          );
        })}
      </Suspense>
    </Canvas>
  );
}