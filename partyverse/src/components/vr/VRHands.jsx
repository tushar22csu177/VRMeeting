/* src/components/vr/VRHands.jsx
   ───────────────────────────────
   Renders two hand-controller meshes inside the R3F Canvas,
   driven by the live pose refs from useVR.
   The right trigger button also fires a "grab/interact" callback.
*/

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ── Single hand mesh ─────────────────────────────────────── */
function HandMesh({ poseRef, side, onTrigger }) {
  const groupRef    = useRef();
  const gripRef     = useRef();           // inner grip indicator
  const wasPressed  = useRef(false);

  useFrame(() => {
    const pose = poseRef.current;
    if (!pose || !groupRef.current) return;

    // Position
    const [px, py, pz] = pose.position;
    groupRef.current.position.set(px, py, pz);

    // Rotation from quaternion
    const [qx, qy, qz, qw] = pose.quaternion;
    groupRef.current.quaternion.set(qx, qy, qz, qw);

    // Grip squeeze visual feedback
    const triggerPressed = pose.buttons?.trigger ?? false;
    if (gripRef.current) {
      const targetScale = triggerPressed ? 0.75 : 1.0;
      gripRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.25
      );
    }

    // Fire callback once on trigger press
    if (triggerPressed && !wasPressed.current) {
      onTrigger?.(side, pose.position);
    }
    wasPressed.current = triggerPressed;
  });

  const isLeft   = side === "left";
  const baseColor = isLeft ? "#3a7bd5" : "#d53a3a";
  const glowColor = isLeft ? "#63b3ed" : "#fc8181";

  return (
    <group ref={groupRef}>
      {/* Controller body */}
      <mesh castShadow>
        <boxGeometry args={[0.04, 0.12, 0.025]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.35}
          metalness={0.6}
          emissive={glowColor}
          emissiveIntensity={0.18}
        />
      </mesh>

      {/* Grip "button" indicator */}
      <mesh ref={gripRef} position={[isLeft ? 0.022 : -0.022, 0, 0]}>
        <sphereGeometry args={[0.014, 8, 8]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Pointing ray */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.25, 6]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.55} />
      </mesh>

      {/* Soft glow point light */}
      <pointLight
        color={glowColor}
        intensity={0.8}
        distance={0.6}
        decay={2}
      />
    </group>
  );
}

/* ── Both hands exported as one component ──────────────────── */
export default function VRHands({ leftHandRef, rightHandRef, onTrigger }) {
  return (
    <>
      <HandMesh poseRef={leftHandRef}  side="left"  onTrigger={onTrigger} />
      <HandMesh poseRef={rightHandRef} side="right" onTrigger={onTrigger} />
    </>
  );
}
