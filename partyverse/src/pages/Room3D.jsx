import React, { useEffect, useState, Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PointerLockControls,
  useGLTF,
  useProgress,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import socket from "../lib/socket";

/* LOADER */
function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)}%</Html>;
}

/* HEAD TRACKER */
function HeadTracker({ roomId }) {
  const { camera } = useThree();
  const last = useRef(0);

  useFrame(() => {
    const now = Date.now();
    if (now - last.current > 100) {
      last.current = now;

      socket.emit("headMove", {
        roomId,
        rotation: [
          camera.rotation.x,
          camera.rotation.y,
          camera.rotation.z,
        ],
      });
    }
  });

  return null;
}

/* SPECTATOR CONTROLS */
function SpectatorControls() {
  const { camera } = useThree();
  const keys = useRef({});

  useEffect(() => {
    const down = (e) => (keys.current[e.code] = true);
    const up = (e) => (keys.current[e.code] = false);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame(() => {
    const speed = 0.12;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    if (keys.current["KeyW"]) camera.position.addScaledVector(forward, speed);
    if (keys.current["KeyS"]) camera.position.addScaledVector(forward, -speed);
    if (keys.current["KeyA"]) camera.position.addScaledVector(right, -speed);
    if (keys.current["KeyD"]) camera.position.addScaledVector(right, speed);
  });

  return null;
}

/* SEAT */
function createSeatAnchor(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  box.getCenter(center);
  center.y += 1.2;

  return {
    seatId: object.name,
    position: [center.x, center.y, center.z],
  };
}

/* AVATAR */
function Avatar({ position, name, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      <Html distanceFactor={10}>
        <div style={{ color: "white" }}>{name}</div>
      </Html>
    </group>
  );
}

/* MODEL */
function Model({ onSeatClick }) {
  const { scene } = useGLTF("/models/Jazz_Club.glb");

  return (
    <primitive
      object={scene}
      scale={0.9}
      onPointerDown={(e) => {
        e.stopPropagation();
        const name = e.object.name.toLowerCase();

        if (name.includes("chair") || name.includes("stool")) {
          onSeatClick(e.object);
        }
      }}
    />
  );
}

/* CAMERA SNAP */
function CameraController({ anchor }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!anchor) return;
    camera.position.set(...anchor.position);
  }, [anchor]);

  return null;
}

/* MAIN */
export default function Room3D() {
  const roomId = "room1";

  const user = {
    id: socket.id,
    name: "User" + Math.floor(Math.random() * 1000),
  };

  const [anchor, setAnchor] = useState(null);
  const [seats, setSeats] = useState({});

  useEffect(() => {
    socket.emit("joinRoom", {
      roomId,
      userId: socket.id,
      name: user.name,
    });

    socket.on("seatState", setSeats);
    socket.on("seatUpdate", setSeats);

    return () => {
      socket.off("seatState");
      socket.off("seatUpdate");
    };
  }, []);

  const handleSeatClick = (obj) => {
    const seat = createSeatAnchor(obj);

    if (seats[seat.seatId]) {
      alert("Seat taken");
      return;
    }

    socket.emit("takeSeat", {
      roomId,
      seatName: seat.seatId,
      userId: socket.id,
      name: user.name,
      position: seat.position,
    });

    setAnchor(seat);
  };

  const leaveSeat = () => {
    if (!anchor) return;

    socket.emit("leaveSeat", {
      roomId,
      seatName: anchor.seatId,
    });

    setAnchor(null);
  };

  return (
    <div style={{ height: "100vh" }}>
      <Canvas camera={{ position: [0, 5, 15] }}>
        <ambientLight intensity={1} />

        <Suspense fallback={<Loader />}>
          <Model onSeatClick={handleSeatClick} />
        </Suspense>

        <CameraController anchor={anchor} />

        {!anchor && (
          <>
            <OrbitControls />
            <SpectatorControls />
          </>
        )}

        {anchor && <PointerLockControls />}

        <HeadTracker roomId={roomId} />

        {Object.entries(seats).map(([id, data]) => (
          <Avatar
            key={id}
            position={data.position}
            name={data.name}
            rotation={data.rotation}
          />
        ))}
      </Canvas>

      {anchor && (
        <button onClick={leaveSeat} style={{ position: "absolute", top: 20 }}>
          Leave Seat
        </button>
      )}
    </div>
  );
}

useGLTF.preload("/models/Jazz_Club.glb");