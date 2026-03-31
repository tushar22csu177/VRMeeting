// src/components/Avatar.jsx

import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export default function Avatar({
  position,
  rotation,
  avatarType,
  headRotation,
  isMe,
}) {
  const group = useRef();

  const { scene, animations } = useGLTF(
    avatarType === "female"
      ? "/models/female.glb"
      : "/models/male.glb"
  );

  const { actions } = useAnimations(animations, group);

  /* 🔥 DEBUG ANIMATION */
  useEffect(() => {
    console.log("Animations:", animations);
  }, [animations]);

  /* ================= PLAY ANIMATION ================= */
  useEffect(() => {
    if (!actions) return;

    const keys = Object.keys(actions);

    if (keys.length === 0) {
      console.log("❌ NO ANIMATION FOUND");
      return;
    }

    const anim = actions[keys[0]];

    if (anim) {
      anim.reset().fadeIn(0.3).play();
      console.log("✅ Playing animation:", keys[0]);
    }
  }, [actions]);

  /* ================= HIDE HEAD ================= */
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (child.isMesh && isMe) {
        if (
          child.name.toLowerCase().includes("head") ||
          child.name.toLowerCase().includes("neck")
        ) {
          child.visible = false;
        }
      }
    });
  }, [scene, isMe]);

  /* ================= HEAD ROTATION ================= */
  useEffect(() => {
    if (!group.current || !headRotation) return;

    group.current.traverse((child) => {
      if (child.name.toLowerCase().includes("head")) {
        child.rotation.x = headRotation.x;
        child.rotation.y = headRotation.y;
      }
    });
  }, [headRotation]);

  return (
    <group ref={group} position={position} rotation={rotation} scale={0.9}>
      <primitive object={scene} />
    </group>
  );
}