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
      if (child.isMesh && child.name.toLowerCase().includes("chair")) {
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

  /* KEYBOARD */
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

  /* POINTER LOCK */
  useEffect(() => {
    const click = () => {
      if (enabled) {
        document.body.requestPointerLock();
      }
    };

    window.addEventListener("click", click);
    return () => window.removeEventListener("click", click);
  }, [enabled]);

  /* MOUSE LOOK */
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

  /* MOVEMENT */
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

/* ================= CAMERA SYSTEM ================= */
function CameraSystem({ seatObj, thirdPerson }) {
  const { camera } = useThree();

  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    const move = (e) => {
      if (!seatObj) return;

      yaw.current -= e.movementX * 0.002;
      pitch.current -= e.movementY * 0.002;

      pitch.current = Math.max(-0.5, Math.min(0.5, pitch.current));
    };

    document.addEventListener("mousemove", move);
    return () => document.removeEventListener("mousemove", move);
  }, [seatObj]);

  useFrame(() => {
    if (!seatObj) return;

    const pos = new THREE.Vector3();
    seatObj.getWorldPosition(pos);

    const dir = new THREE.Vector3(
      Math.sin(yaw.current),
      0,
      Math.cos(yaw.current)
    );

    let camPos;

    if (thirdPerson) {
      camPos = pos.clone()
        .add(new THREE.Vector3(0, 1.6, 0))
        .add(dir.clone().multiplyScalar(-2.5));
    } else {
      camPos = pos.clone()
        .add(new THREE.Vector3(0, 1.2, 0))
        .add(dir.clone().multiplyScalar(0.3));
    }

    camera.position.lerp(camPos, 0.15);

    const lookTarget = pos.clone().add(new THREE.Vector3(0, 1.2, 0)).add(dir);
    camera.lookAt(lookTarget);
  });

  return null;
}

/* ================= SEAT SNAP ================= */
function getSeatAnchor(obj) {
  const raycaster = new THREE.Raycaster();

  const center = new THREE.Vector3();
  obj.getWorldPosition(center);

  const origin = center.clone().add(new THREE.Vector3(0, 2, 0));
  raycaster.set(origin, new THREE.Vector3(0, -1, 0));

  const intersects = raycaster.intersectObject(obj, true);

  let y = center.y;

  if (intersects.length > 0) {
    let best = intersects[0];
    for (let i = 1; i < intersects.length; i++) {
      if (intersects[i].point.y > best.point.y) best = intersects[i];
    }
    y = best.point.y + 0.03;
  }

  const quat = obj.getWorldQuaternion(new THREE.Quaternion());
  const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
  const offset = forward.multiplyScalar(-0.25);

  const rotY = new THREE.Euler().setFromQuaternion(quat).y;

  return {
    position: [center.x + offset.x, y, center.z + offset.z],
    rotation: [0, rotY, 0],
  };
}

/* ================= MAIN ================= */
export default function Room3D() {
  const { roomId } = useParams();

  const [seatMap, setSeatMap] = useState({});
  const [seatObjects, setSeatObjects] = useState({});
  const [mySeat, setMySeat] = useState(null);
  const [thirdPerson, setThirdPerson] = useState(true);

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

  useEffect(() => {
    const found = Object.entries(seatMap).find(([_, uid]) => uid === userId);
    if (found) setMySeat(found[0]);
  }, [seatMap]);

  useEffect(() => {
    const toggle = (e) => {
      if (e.key.toLowerCase() === "v") {
        setThirdPerson((p) => !p);
      }
    };
    window.addEventListener("keydown", toggle);
    return () => window.removeEventListener("keydown", toggle);
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

        {/* WALK MODE */}
        <FPSControls enabled={!mySeat} />

        {/* SIT MODE CAMERA */}
        {mySeat && (
          <CameraSystem
            seatObj={seatObjects[mySeat]}
            thirdPerson={thirdPerson}
          />
        )}

        {/* AVATARS */}
        {Object.entries(seatMap).map(([seatName, uid]) => {
          const obj = seatObjects[seatName];
          if (!obj) return null;

          const anchor = getSeatAnchor(obj);

          if (uid === userId && !mySeat) return null;

          return (
            <Avatar
              key={seatName + "-" + uid}
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