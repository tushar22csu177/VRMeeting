// src/components/Avatar.jsx
// 🎭 Enhanced Avatar — smooth walk/idle blending, name tag, shadow

import React, { useEffect, useRef, useCallback } from "react";
import { useGLTF, useAnimations, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Avatar({
  position = [0, 0, 0],
  targetPosition,
  rotation,
  avatarType = "male",
  isMe = false,
  username = "",
  headRotation,
}) {
  const groupRef = useRef();
  const currentPos = useRef(new THREE.Vector3(...position));
  const currentRotY = useRef(rotation?.[1] ?? 0);
  const isWalking = useRef(false);
  const target = useRef(new THREE.Vector3(...(targetPosition || position)));

  const modelPath =
    avatarType === "female" ? "/models/female.glb" : "/models/male.glb";

  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, groupRef);

  /* ────────────────────────────────────────────
     Play a named animation (partial match, fallback to first)
  ──────────────────────────────────────────── */
  const playAnim = useCallback(
    (name) => {
      if (!actions) return;
      const keys = Object.keys(actions);
      if (keys.length === 0) return;

      const matchKey =
        keys.find((k) => k.toLowerCase().includes(name)) || keys[0];

      const anim = actions[matchKey];
      if (!anim) return;

      // Fade out all others
      keys.forEach((k) => {
        if (k !== matchKey) actions[k]?.fadeOut(0.25);
      });

      anim.reset().fadeIn(0.25).play();
    },
    [actions]
  );

  /* ────────────────────────────────────────────
     Start with idle on mount
  ──────────────────────────────────────────── */
  useEffect(() => {
    if (!actions) return;
    playAnim("idle");
  }, [actions]);

  /* ────────────────────────────────────────────
     Update movement target
  ──────────────────────────────────────────── */
  useEffect(() => {
    if (!targetPosition) return;
    target.current.set(...targetPosition);
  }, [targetPosition]);

  /* ────────────────────────────────────────────
     Hide head for first-person perspective (isMe)
  ──────────────────────────────────────────── */
  useEffect(() => {
    if (!scene || !isMe) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        const n = child.name.toLowerCase();
        if (n.includes("head") || n.includes("neck") || n.includes("hair")) {
          child.visible = false;
        }
      }
    });
  }, [scene, isMe]);

  /* ────────────────────────────────────────────
     Head rotation (for look-around)
  ──────────────────────────────────────────── */
  useEffect(() => {
    if (!groupRef.current || !headRotation) return;
    groupRef.current.traverse((child) => {
      const n = child.name.toLowerCase();
      if (n.includes("head") || n.includes("neck")) {
        child.rotation.x = headRotation.x * 0.5;
        child.rotation.y = headRotation.y * 0.5;
      }
    });
  }, [headRotation]);

  /* ────────────────────────────────────────────
     Per-frame: smooth walk toward target, auto-rotate
  ──────────────────────────────────────────── */
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const pos = currentPos.current;
    const tgt = target.current;
    const dist = pos.distanceTo(tgt);

    if (dist > 0.06) {
      // Switch to walking
      if (!isWalking.current) {
        isWalking.current = true;
        playAnim("walk");
      }

      // Smooth rotation toward movement direction
      const dir = new THREE.Vector3().subVectors(tgt, pos).normalize();
      const targetAngle = Math.atan2(dir.x, dir.z);
      const diff = ((targetAngle - currentRotY.current + Math.PI) % (Math.PI * 2)) - Math.PI;
      currentRotY.current += diff * Math.min(delta * 10, 1);

      // Move
      const speed = Math.min(3.5 * delta, dist);
      pos.addScaledVector(dir, speed);
    } else {
      // Switch to idle
      if (isWalking.current) {
        isWalking.current = false;
        playAnim("idle");
      }

      // Snap to target when very close
      if (dist > 0.001) {
        pos.lerp(tgt, 0.3);
      }
    }

    groupRef.current.position.copy(pos);
    groupRef.current.rotation.y = currentRotY.current;
  });

  return (
    <group ref={groupRef} scale={0.9}>
      {/* 3D Model */}
      <primitive object={scene} castShadow receiveShadow />

      {/* Floating name tag */}
      {username && (
        <Text
          position={[0, 2.4, 0]}
          fontSize={0.16}
          color={isMe ? "#64dfdf" : "#f1f5f9"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.008}
          outlineColor="#000000"
        >
          {isMe ? `${username} (you)` : username}
        </Text>
      )}

      {/* Soft drop shadow */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
        renderOrder={-1}
      >
        <circleGeometry args={[0.38, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
