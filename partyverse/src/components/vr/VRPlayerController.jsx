/* src/components/vr/VRPlayerController.jsx
   ──────────────────────────────────────────
   Drop-in replacement / companion to PlayerController that runs
   when vrConnected===true.

   • Head pose  → camera position & orientation
   • Left-stick → smooth locomotion (comfort mode, no tilt-based movement)
   • posRef     → same mutable object used by the desktop controller &
                  the socket emit loop, so the avatar body follows naturally
   • Three.js camera is NOT overridden if WebXR is handling it; instead we
     keep the desktop cam synced for the non-XR fallback view and write
     posRef so the avatar body stays under the head.
*/

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const WALK_SPD = 3.5;
const BOUNDS   = 11.5;

export default function VRPlayerController({ posRef, headPoseRef, leftHandRef }) {
  const { camera } = useThree();

  useFrame((_, dt) => {
    const head = headPoseRef.current;
    const left = leftHandRef.current;
    const p    = posRef.current;

    // ── Locomotion via left thumbstick ──
    if (left?.buttons) {
      const ax = left.buttons.axisX ?? 0;  // strafe
      const ay = left.buttons.axisY ?? 0;  // forward/back

      const deadzone = 0.12;
      if (Math.abs(ax) > deadzone || Math.abs(ay) > deadzone) {
        // Get forward direction from head yaw only (ignore pitch)
        const headQ = head
          ? new THREE.Quaternion(...head.quaternion)
          : new THREE.Quaternion();

        const euler = new THREE.Euler().setFromQuaternion(headQ, "YXZ");
        const yaw   = euler.y;

        const fw = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
        const rt = new THREE.Vector3( Math.cos(yaw), 0, -Math.sin(yaw));

        const mv = new THREE.Vector3();
        if (Math.abs(ay) > deadzone) mv.addScaledVector(fw, -ay);
        if (Math.abs(ax) > deadzone) mv.addScaledVector(rt,  ax);

        if (mv.lengthSq() > 0) {
          mv.normalize().multiplyScalar(WALK_SPD * dt);
          p.x = Math.max(-BOUNDS, Math.min(BOUNDS, p.x + mv.x));
          p.z = Math.max(-BOUNDS, Math.min(BOUNDS, p.z + mv.z));
          p.moving  = true;
          p.rotY    = yaw + Math.PI;
        } else {
          p.moving = false;
        }
      } else {
        p.moving = false;
      }
    }

    // ── Sync camera to head pose (non-XR fallback view) ──
    if (head) {
      const [hx, hy, hz] = head.position;
      // World position = player floor position + head offset
      camera.position.set(p.x + hx, hy, p.z + hz);
      camera.quaternion.set(...head.quaternion);
    }
  });

  return null;
}
