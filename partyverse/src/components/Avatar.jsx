// src/components/Avatar.jsx

import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export default function Avatar({
  position,
  rotation,
  avatarType,
}) {
  const group = useRef();

  /* ================= LOAD MODEL ================= */
  const { scene, animations } = useGLTF(
    avatarType === "female"
      ? "/models/female.glb"
      : "/models/male.glb"
  );

  /* ================= ANIMATION ================= */
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (!actions) return;

    const names = Object.keys(actions);

    console.log("Available animations:", names);

    if (names.length === 0) {
      console.warn("❌ No animations found in GLB");
      return;
    }

    /* ================= PLAY FIRST ANIMATION ================= */
    const action = actions[names[0]];
    action.reset().fadeIn(0.3).play();

    return () => action.fadeOut(0.3);
  }, [actions]);

  /* ================= SCALE FIX ================= */
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
  }, [scene]);

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      scale={0.9}
    >
      <primitive object={scene} />
    </group>
  );
}