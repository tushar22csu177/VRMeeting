import React, { useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PointerLockControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

/* ===========================
   CREATE SEAT ANCHOR
=========================== */
function createSeatAnchor(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  box.getCenter(center);

  center.y += 0.8;

  const dir = new THREE.Vector3();
  object.getWorldDirection(dir);

  return { position: center, direction: dir };
}

/* ===========================
   MODEL WITH HIGHLIGHT
=========================== */
function Model({ onSeatClick, takenSeats }) {
  const { scene } = useGLTF("/models/Jazz_Club.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.userData.originalColor = child.material.color.clone();
      }
    });
  }, [scene]);

  const handlePointerOver = (e) => {
    const obj = e.object;
    const name = obj.name.toLowerCase();

    if (name.includes("chair") || name.includes("stool")) {
      if (takenSeats[obj.name]) {
        obj.material.color.set("red");
      } else {
        obj.material.color.set("green");
      }
    }
  };

  const handlePointerOut = (e) => {
    const obj = e.object;

    if (obj.userData.originalColor) {
      obj.material.color.copy(obj.userData.originalColor);
    }
  };

  return (
    <primitive
      object={scene}
      scale={0.9}
      onPointerDown={(e) => {
        e.stopPropagation();

        const obj = e.object;
        const name = obj.name.toLowerCase();

        if (name.includes("chair") || name.includes("stool")) {
          onSeatClick(obj);
        }
      }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
}

/* ===========================
   CAMERA (ANCHOR)
=========================== */
function CameraController({ anchor }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!anchor) return;

    camera.position.copy(anchor.position);

    const lookTarget = anchor.position.clone().add(anchor.direction);
    camera.lookAt(lookTarget);
  }, [anchor, camera]);

  return null;
}

/* ===========================
   VR CONTROLS
=========================== */
function VRControls({ active }) {
  const { gl } = useThree();

  useEffect(() => {
    if (active) {
      gl.domElement.requestPointerLock();
    }
  }, [active, gl]);

  return active ? <PointerLockControls /> : null;
}

/* ===========================
   MAIN ROOM
=========================== */
export default function Room3D() {
  const [anchor, setAnchor] = useState(null);
  const [takenSeats, setTakenSeats] = useState({});

  const handleSeatClick = (seatObject) => {
    const seatName = seatObject.name;

    if (takenSeats[seatName]) {
      alert("Seat already taken!");
      return;
    }

    setTakenSeats((prev) => ({
      ...prev,
      [seatName]: "YOU",
    }));

    const newAnchor = createSeatAnchor(seatObject);
    setAnchor(newAnchor);
  };

  return (
    <div style={{ height: "100vh", background: "#111" }}>
      <Canvas camera={{ position: [0, 6, 12], fov: 60 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} />

        <Model
          onSeatClick={handleSeatClick}
          takenSeats={takenSeats}
        />

        <CameraController anchor={anchor} />

        {!anchor && <OrbitControls />}

        <VRControls active={!!anchor} />
      </Canvas>

      {anchor && (
        <button
          onClick={() => setAnchor(null)}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            padding: "10px",
            background: "white",
            borderRadius: "8px",
          }}
        >
          Leave Seat
        </button>
      )}
    </div>
  );
}