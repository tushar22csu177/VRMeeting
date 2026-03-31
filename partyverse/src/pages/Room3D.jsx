// src/pages/Room3D.jsx

import React, { useState, useEffect, Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, useProgress, useGLTF, useAnimations } from "@react-three/drei";
import socket from "../lib/socket";
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

/* ================= AVATAR WITH ANIMATION ================= */
function MyAvatar({ position, rotation, gender }) {
  const group = useRef();

  const { scene, animations } = useGLTF(
    gender === "female" ? "/models/female.glb" : "/models/male.glb"
  );

  const { actions } = useAnimations(animations, group);

  /* ▶️ PLAY SITTING ANIMATION */
  useEffect(() => {
    if (!actions) return;

    const names = Object.keys(actions);

    if (names.length > 0) {
      actions[names[0]].reset().fadeIn(0.3).play();
    }
  }, [actions]);

  return (
    <group ref={group} position={position} rotation={rotation}>
      <primitive object={scene.clone()} scale={1} />
    </group>
  );
}

/* ================= MODEL ================= */
function Model({ setSeats, setAnchors, onSeatClick }) {
  const { scene } = useGLTF("/models/Jazz_Club.glb");

  useEffect(() => {
    const seats = {};
    const anchors = {};

    scene.traverse((child) => {
      const name = child.name.toLowerCase();

      if (child.isMesh && name.includes("chair")) {
        seats[child.name] = child;
      }

      if (name.includes("anchor")) {
        anchors[child.name] = child;
      }
    });

    setSeats(seats);
    setAnchors(anchors);
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

/* ================= FPS ================= */
function FPSControls({ enabled }) {
  const { camera } = useThree();
  const keys = useRef({});
  const yaw = useRef(0);

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
  });

  return null;
}

/* ================= CAMERA ================= */
function CameraSystem({ anchor, firstPerson }) {
  const { camera } = useThree();

  useFrame(() => {
    if (!anchor) return;

    const pos = new THREE.Vector3();
    anchor.getWorldPosition(pos);

    if (firstPerson) {
      camera.position.lerp(pos.clone().add(new THREE.Vector3(0, 1.2, 0)), 0.2);
    } else {
      camera.position.lerp(pos.clone().add(new THREE.Vector3(0, 2, 3)), 0.2);
    }

    camera.lookAt(pos.clone().add(new THREE.Vector3(0, 1.2, 0)));
  });

  return null;
}

/* ================= MAIN ================= */
export default function Room3D() {
  const { roomId } = useParams();

  const [seatMap, setSeatMap] = useState({});
  const [seatObjects, setSeatObjects] = useState({});
  const [anchors, setAnchors] = useState({});
  const [mySeat, setMySeat] = useState(null);
  const [firstPerson, setFirstPerson] = useState(true);

  const userId = localStorage.getItem("userId");
  const gender = localStorage.getItem("gender") || "female";

  /* SOCKET */
  useEffect(() => {
    socket.emit("joinRoom", { roomId, userId });

    socket.on("seatState", setSeatMap);
    socket.on("seatUpdate", setSeatMap);

    return () => {
      socket.off("seatState");
      socket.off("seatUpdate");
    };
  }, []);

  /* CAMERA SWITCH */
  useEffect(() => {
    const key = (e) => {
      if (e.key === "f") setFirstPerson(true);
      if (e.key === "v") setFirstPerson(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  const handleSeatClick = (seatName) => {
    if (seatMap[seatName]) return;

    socket.emit("takeSeat", { roomId, seatName, userId });
    setMySeat(seatName);
  };

  /* FIND CLOSEST ANCHOR */
  const getAnchor = (seatObj) => {
    let closest = null;
    let minDist = Infinity;

    const seatPos = new THREE.Vector3();
    seatObj.getWorldPosition(seatPos);

    Object.values(anchors).forEach((a) => {
      const p = new THREE.Vector3();
      a.getWorldPosition(p);

      const d = p.distanceTo(seatPos);
      if (d < minDist) {
        minDist = d;
        closest = a;
      }
    });

    return closest;
  };

  return (
    <Canvas camera={{ position: [0, 2, 5] }}>
      <ambientLight />
      <directionalLight position={[5, 5, 5]} />

      <Suspense fallback={<Loader />}>
        <Model
          setSeats={setSeatObjects}
          setAnchors={setAnchors}
          onSeatClick={handleSeatClick}
        />

        <FPSControls enabled={!mySeat} />

        {mySeat && (
          <CameraSystem
            anchor={getAnchor(seatObjects[mySeat])}
            firstPerson={firstPerson}
          />
        )}

        {/* AVATARS */}
        {Object.entries(seatMap).map(([seatName, uid]) => {
          const seatObj = seatObjects[seatName];
          if (!seatObj) return null;

          const anchor = getAnchor(seatObj);
          if (!anchor) return null;

          const pos = new THREE.Vector3();
          anchor.getWorldPosition(pos);

          const rot = new THREE.Euler().setFromQuaternion(
            anchor.getWorldQuaternion(new THREE.Quaternion())
          );

          return (
            <MyAvatar
              key={seatName + "-" + uid}
              position={[pos.x, pos.y, pos.z]}
              rotation={[0, rot.y, 0]}
              gender={gender}
            />
          );
        })}
      </Suspense>
    </Canvas>
  );
}