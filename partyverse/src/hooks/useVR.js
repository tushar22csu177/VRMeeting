// src/hooks/useVR.js
import { useEffect, useRef, useCallback, useState } from "react";

export function useVR({ onConnected, onDisconnected, gl } = {}) {
  const [vrSupported,        setVrSupported]        = useState(false);
  const [vrConnected,        setVrConnected]        = useState(false);

  const sessionRef  = useRef(null);
  const glRef       = useRef(gl || null); // Three.js WebGLRenderer

  const headPose  = useRef(null);
  const leftHand  = useRef(null);
  const rightHand = useRef(null);

  // Allow renderer to be set after mount (from Canvas onCreated)
  const setRenderer = useCallback((renderer) => {
    glRef.current = renderer;
  }, []);

  /* ── SUPPORT DETECTION ── */
  useEffect(() => {
    if (navigator.xr) {
      navigator.xr
        .isSessionSupported("immersive-vr")
        .then((ok) => setVrSupported(ok))
        .catch(() => setVrSupported(false));
    }
  }, []);

  /* ── PER-FRAME POSE EXTRACTION ── */
  const onXRFrame = useCallback((time, frame) => {
    const session = sessionRef.current;
    if (!session) return;

    session.requestAnimationFrame(onXRFrame);

    const refSpace = session._refSpace;
    if (!refSpace) return;

    const viewerPose = frame.getViewerPose(refSpace);
    if (viewerPose) {
      const t = viewerPose.transform.position;
      const q = viewerPose.transform.orientation;
      headPose.current = {
        position:   [t.x, t.y, t.z],
        quaternion: [q.x, q.y, q.z, q.w],
      };
    }

    for (const source of session.inputSources) {
      if (!source.gripSpace) continue;
      const gripPose = frame.getPose(source.gripSpace, refSpace);
      if (!gripPose) continue;
      const p = gripPose.transform.position;
      const q = gripPose.transform.orientation;
      const gp = source.gamepad;
      const buttons = gp ? {
        trigger:    gp.buttons[0]?.pressed ?? false,
        grip:       gp.buttons[1]?.pressed ?? false,
        thumbstick: gp.buttons[3]?.pressed ?? false,
        a:          gp.buttons[4]?.pressed ?? false,
        b:          gp.buttons[5]?.pressed ?? false,
        axisX:      gp.axes[2] ?? 0,
        axisY:      gp.axes[3] ?? 0,
      } : {};
      const state = { position: [p.x, p.y, p.z], quaternion: [q.x, q.y, q.z, q.w], buttons };
      if (source.handedness === "left")  leftHand.current  = state;
      if (source.handedness === "right") rightHand.current = state;
    }
  }, []);

  /* ── ENTER VR — THE KEY FIX IS HERE ── */
  const enterVR = useCallback(async () => {
    if (!navigator.xr) return;

    const renderer = glRef.current;
    if (!renderer) {
      console.warn("useVR: no Three.js renderer available yet");
      return;
    }

    try {
      const session = await navigator.xr.requestSession("immersive-vr", {
        requiredFeatures: ["local-floor"],
        optionalFeatures: ["bounded-floor", "hand-tracking", "viewer"],
      });

      // ★ THIS IS THE CRITICAL LINE — wire the XR session to Three.js renderer
      await renderer.xr.setSession(session);

      let refSpace;
      try {
        refSpace = await session.requestReferenceSpace("local-floor");
      } catch {
        refSpace = await session.requestReferenceSpace("viewer");
      }
      session._refSpace = refSpace;
      sessionRef.current = session;

      session.addEventListener("end", () => {
        sessionRef.current = null;
        headPose.current   = null;
        leftHand.current   = null;
        rightHand.current  = null;
        setVrConnected(false);
        onDisconnected?.();
      });

      session.requestAnimationFrame(onXRFrame);
      setVrConnected(true);
      onConnected?.();
    } catch (err) {
      console.warn("VR session failed:", err);
    }
  }, [onXRFrame, onConnected, onDisconnected]);

  /* ── EXIT VR ── */
  const exitVR = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.end().catch(() => {});
      sessionRef.current = null;
    }
    setVrConnected(false);
  }, []);

  /* ── CLEANUP ── */
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.end().catch(() => {});
      }
    };
  }, []);

  return {
    vrSupported,
    vrConnected,
    enterVR,
    exitVR,
    setRenderer, // ← expose this
    headPose,
    leftHand,
    rightHand,
  };
}