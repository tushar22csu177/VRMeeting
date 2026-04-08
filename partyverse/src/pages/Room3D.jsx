// src/pages/Room3D.jsx
// ✅ WASD · Mouse-look · Sit/Stand on chairs · Multiplayer · Background Music · VR · Google Cardboard

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, useProgress } from "@react-three/drei";
import socket from "../lib/socket";
import { useParams, useNavigate } from "react-router-dom";
import * as THREE from "three";
import { useVR } from "../hooks/useVR";
import VRConnectedPopup from "../components/vr/VRConnectedPopup";
import VRHands from "../components/vr/VRHands";
import VRPlayerController from "../components/vr/VRPlayerController";


/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const SPAWN     = [0, 0, 6];
const BOUNDS    = 11.5;
const WALK_SPD  = 4.5;
const SEAT_H    = 0.46;

const TABLE_POSITIONS = [
  [-5,-4], [-5,0], [-5,4],
  [-2,-5], [-2,-1], [-2, 3],
  [ 1,-4], [ 1, 0], [ 1, 4],
  [ 5,-5], [ 5,-1], [ 5, 3],
];

const CHAIR_OFFSETS = [
  [ 0.78, 0,       Math.PI      ],
  [-0.78, 0,       0            ],
  [ 0,    0.78,   -Math.PI/2   ],
  [ 0,   -0.78,    Math.PI/2   ],
];

const ALL_CHAIRS = [];
TABLE_POSITIONS.forEach(([tx, tz], ti) => {
  CHAIR_OFFSETS.forEach(([ox, oz, faceAngle], ci) => {
    ALL_CHAIRS.push({
      id:        `${ti}_${ci}`,
      pos:       [tx + ox, 0, tz + oz],
      faceAngle,
      chairRot:  faceAngle + Math.PI,
    });
  });
});

const AVATAR_COLORS = ["#ef4444","#22c55e","#f59e0b","#a855f7","#ec4899","#14b8a6","#3b82f6","#f97316"];

const TRACKS = [
  { title: "Autumn Leaves",    artist: "Jazz Quartet",   url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Blue Bossa",       artist: "Night Session",  url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Summertime",       artist: "Club Ensemble",  url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { title: "Take Five",        artist: "The Trio",       url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { title: "So What",          artist: "Late Night Set", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
];

/* ═══════════════════════════════════════════════════════════
   LOADER
═══════════════════════════════════════════════════════════ */
function Loader() {
  const { progress } = useProgress();
  return (
    <Html fullscreen>
      <div style={{ height:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", background:"#080401",
        fontFamily:"system-ui", color:"#f5c880", gap:16 }}>
        <div style={{fontSize:52}}>🎷</div>
        <div style={{fontSize:15, fontWeight:700, letterSpacing:2}}>LOADING JAZZ CLUB</div>
        <div style={{width:220, height:3, background:"#2a1a0a", borderRadius:2, overflow:"hidden"}}>
          <div style={{height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#f5c880,#ff9933)", transition:"width .2s"}}/>
        </div>
        <div style={{fontSize:12, color:"#6b4a1a"}}>{Math.round(progress)}%</div>
      </div>
    </Html>
  );
}

/* ═══════════════════════════════════════════════════════════
   JAZZ CLUB GEOMETRY
═══════════════════════════════════════════════════════════ */
function Floor() {
  const tiles = useMemo(() => {
    const t = [];
    for (let x = -9; x <= 9; x++)
      for (let z = -9; z <= 9; z++)
        t.push({ x, z, dark: (x + z) % 2 === 0 });
    return t;
  }, []);
  return (
    <>
      {tiles.map(({ x, z, dark }) => (
        <mesh key={`${x}_${z}`} position={[x*1.3, 0.001, z*1.3]}
          rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.28, 1.28]} />
          <meshStandardMaterial color={dark ? "#4a2e14" : "#5a3c1e"} roughness={0.95} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2e1a0a" roughness={1} />
      </mesh>
    </>
  );
}

function Walls() {
  const m = <meshStandardMaterial color="#3d2010" roughness={0.95} />;
  return (
    <>
      <mesh position={[0,5,-13]} castShadow receiveShadow><boxGeometry args={[26,10,0.35]}/>{m}</mesh>
      <mesh position={[0,5, 13]} castShadow receiveShadow><boxGeometry args={[26,10,0.35]}/>{m}</mesh>
      <mesh position={[-13,5,0]} castShadow receiveShadow><boxGeometry args={[0.35,10,26]}/>{m}</mesh>
      <mesh position={[ 13,5,0]} castShadow receiveShadow><boxGeometry args={[0.35,10,26]}/>{m}</mesh>
      <mesh position={[0,10,0]}><boxGeometry args={[26,0.4,26]}/><meshStandardMaterial color="#180d04"/></mesh>
      {[[-13,0],[13,0],[0,-13],[0,13]].map(([px,pz],i)=>(
        <mesh key={i} position={[px,0.6,pz]}>
          <boxGeometry args={i<2?[0.05,1.2,26]:[26,1.2,0.05]}/>
          <meshStandardMaterial color="#8b5e2e" roughness={0.6} metalness={0.1}/>
        </mesh>
      ))}
    </>
  );
}

function Stage() {
  return (
    <group position={[0,0,-10]}>
      <mesh position={[0,0.35,0]} castShadow receiveShadow>
        <boxGeometry args={[11,0.7,5]}/>
        <meshStandardMaterial color="#5c3d1e" roughness={0.7}/>
      </mesh>
      <mesh position={[0,0.72,2.5]}>
        <boxGeometry args={[11,0.1,0.18]}/>
        <meshStandardMaterial color="#c8941a" metalness={0.7} roughness={0.2}/>
      </mesh>
      {[-5.2,5.2].map((x,i)=>(
        <mesh key={i} position={[x,4,-0.5]}>
          <boxGeometry args={[0.4,8,5]}/>
          <meshStandardMaterial color="#8b0000" roughness={0.9}/>
        </mesh>
      ))}
      <mesh position={[0,1.7,0.8]} castShadow>
        <cylinderGeometry args={[0.025,0.025,2,8]}/>
        <meshStandardMaterial color="#aaa" metalness={0.85} roughness={0.15}/>
      </mesh>
      <mesh position={[0,2.65,0.8]}>
        <sphereGeometry args={[0.09,8,8]}/>
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1}/>
      </mesh>
      <group position={[-3.5,0.7,0.8]}>
        <mesh castShadow><boxGeometry args={[2.4,1,1.3]}/><meshStandardMaterial color="#0a0a0a" roughness={0.25} metalness={0.3}/></mesh>
        <mesh position={[0,0.52,-0.25]}><boxGeometry args={[2,0.06,0.55]}/><meshStandardMaterial color="#f5f0e8"/></mesh>
      </group>
      <group position={[3.5,0.7,-0.3]}>
        <mesh castShadow><cylinderGeometry args={[0.38,0.38,0.55,16]}/><meshStandardMaterial color="#6b1515" roughness={0.75}/></mesh>
        <mesh position={[-0.65,0.12,0.3]} castShadow><cylinderGeometry args={[0.28,0.28,0.32,16]}/><meshStandardMaterial color="#6b1515" roughness={0.75}/></mesh>
      </group>
    </group>
  );
}

function TableMesh({ pos }) {
  return (
    <group position={pos}>
      <mesh position={[0,0.74,0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.52,0.52,0.07,24]}/>
        <meshStandardMaterial color="#3d2510" roughness={0.6}/>
      </mesh>
      <mesh position={[0,0.37,0]}>
        <cylinderGeometry args={[0.045,0.045,0.74,8]}/>
        <meshStandardMaterial color="#5a3820" roughness={0.5}/>
      </mesh>
      <mesh position={[0,0.8,0]}>
        <cylinderGeometry args={[0.033,0.033,0.14,8]}/>
        <meshStandardMaterial color="#f5f0e0"/>
      </mesh>
      <mesh position={[0,0.88,0]}>
        <sphereGeometry args={[0.034,6,6]}/>
        <meshBasicMaterial color="#ffbb00"/>
      </mesh>
      <pointLight position={[0,1.0,0]} color="#ff9900" intensity={1.8} distance={5} decay={2}/>
    </group>
  );
}

function ChairMesh({ chairData, onSit, isOccupied, isMyChair, isNearby }) {
  const { pos, chairRot, id } = chairData;
  const glowColor = isMyChair ? "#64dfdf" : isNearby ? "#f5c880" : isOccupied ? "#ff4444" : "#7a0000";

  return (
    <group
      position={pos}
      rotation={[0, chairRot, 0]}
      onClick={(e) => { e.stopPropagation(); onSit(chairData); }}
      style={{ cursor: "pointer" }}
    >
      <mesh position={[0,0.46,0]} castShadow receiveShadow>
        <boxGeometry args={[0.45,0.07,0.45]}/>
        <meshStandardMaterial color={glowColor} roughness={0.85}
          emissive={isNearby||isMyChair ? glowColor : "#000"}
          emissiveIntensity={isMyChair ? 0.4 : isNearby ? 0.25 : 0}/>
      </mesh>
      <mesh position={[0,0.8,-0.21]} castShadow>
        <boxGeometry args={[0.45,0.62,0.07]}/>
        <meshStandardMaterial color={glowColor} roughness={0.85}
          emissive={isNearby||isMyChair ? glowColor : "#000"}
          emissiveIntensity={isMyChair ? 0.4 : isNearby ? 0.25 : 0}/>
      </mesh>
      {[[-0.19,-0.19],[-0.19,0.19],[0.19,-0.19],[0.19,0.19]].map(([x,z],i)=>(
        <mesh key={i} position={[x,0.22,z]}>
          <cylinderGeometry args={[0.026,0.026,0.46,6]}/>
          <meshStandardMaterial color="#5a3820" roughness={0.6}/>
        </mesh>
      ))}
      {isNearby && !isOccupied && !isMyChair && (
        <Html position={[0, 1.4, 0]} center>
          <div style={{
            background:"rgba(5,2,0,0.9)", border:"1px solid #f5c880",
            borderRadius:8, padding:"4px 10px", color:"#f5c880",
            fontSize:11, fontWeight:700, whiteSpace:"nowrap",
            pointerEvents:"none",
          }}>
            [E] Sit
          </div>
        </Html>
      )}
      {isMyChair && (
        <Html position={[0, 1.4, 0]} center>
          <div style={{
            background:"rgba(5,2,0,0.9)", border:"1px solid #64dfdf",
            borderRadius:8, padding:"4px 10px", color:"#64dfdf",
            fontSize:11, fontWeight:700, whiteSpace:"nowrap",
            pointerEvents:"none",
          }}>
            [E] Stand up
          </div>
        </Html>
      )}
    </group>
  );
}

function Bar() {
  return (
    <group position={[11,0,0]}>
      <mesh position={[0,1.05,0]} castShadow receiveShadow>
        <boxGeometry args={[1.3,1.1,10]}/>
        <meshStandardMaterial color="#3d1f08" roughness={0.6}/>
      </mesh>
      <mesh position={[0,1.62,0]}>
        <boxGeometry args={[1.55,0.1,10.3]}/>
        <meshStandardMaterial color="#150a02" roughness={0.25} metalness={0.25}/>
      </mesh>
      {[2.5,3.5,4.5].map((y,i)=>(
        <mesh key={i} position={[-0.4,y,-0.5]}>
          <boxGeometry args={[0.08,0.06,9]}/>
          <meshStandardMaterial color="#5a3820"/>
        </mesh>
      ))}
      {[-4,-3,-2,-1,0,1,2,3,4].map((z,i)=>(
        <mesh key={i} position={[-0.35,3.1+((i%3)*0.6),z]}>
          <cylinderGeometry args={[0.065,0.065,0.55,8]}/>
          <meshStandardMaterial
            color={["#1a4a1a","#8b3a00","#1a1a6a","#5a0000","#2a4a00","#4a2a00","#003a4a","#4a1a4a","#6a4a00"][i]}
            transparent opacity={0.85}/>
        </mesh>
      ))}
      {[-3,-1,1,3].map((z,i)=>(
        <group key={i} position={[-1,0,z]}>
          <mesh position={[0,0.9,0]}>
            <cylinderGeometry args={[0.22,0.22,0.07,16]}/>
            <meshStandardMaterial color="#7a0000"/>
          </mesh>
          <mesh position={[0,0.45,0]}>
            <cylinderGeometry args={[0.03,0.03,0.9,8]}/>
            <meshStandardMaterial color="#888" metalness={0.8}/>
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WallSconce({ pos }) {
  return (
    <group position={pos}>
      <mesh rotation={[0, pos[0]<0 ? Math.PI/2 : -Math.PI/2, 0]}>
        <coneGeometry args={[0.18,0.28,8]}/>
        <meshStandardMaterial color="#c8941a" metalness={0.6} roughness={0.4}/>
      </mesh>
      <pointLight color="#ffcc66" intensity={5} distance={10} decay={2}/>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   STAGE PERFORMER
═══════════════════════════════════════════════════════════ */
function Saxophone({ position=[0,0,0] }) {
  return (
    <group position={position} rotation={[0.3, 0.4, -0.5]}>
      <mesh position={[0,0,0]}>
        <cylinderGeometry args={[0.055,0.13,0.22,12]}/>
        <meshStandardMaterial color="#c8941a" metalness={0.85} roughness={0.1}/>
      </mesh>
      <mesh position={[0,0.22,0]} rotation={[0.4,0,0]}>
        <cylinderGeometry args={[0.03,0.03,0.55,8]}/>
        <meshStandardMaterial color="#c8941a" metalness={0.85} roughness={0.1}/>
      </mesh>
      <mesh position={[0.06,0.55,0.08]} rotation={[0.8,0,-0.3]}>
        <cylinderGeometry args={[0.022,0.022,0.22,8]}/>
        <meshStandardMaterial color="#c8941a" metalness={0.85} roughness={0.1}/>
      </mesh>
      {[[0,0.08,0.08],[0,0.14,0.09],[0,0.2,0.09],[0,0.28,0.09]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x+0.06,y,z]}>
          <sphereGeometry args={[0.018,6,6]}/>
          <meshStandardMaterial color="#e0b040" metalness={0.9} roughness={0.1}/>
        </mesh>
      ))}
    </group>
  );
}

function MusicNote({ startPos, delay=0 }) {
  const ref  = useRef();
  const age  = useRef(-delay);
  const NOTES = ["♩","♪","♫","♬"];
  const note  = useRef(NOTES[Math.floor(Math.random()*4)]);
  const wobble= useRef(Math.random()*0.8-0.4);
  const CYCLE = 3.5;

  useFrame((_, dt) => {
    age.current += dt;
    if (age.current < 0) return;
    const t = (age.current % CYCLE) / CYCLE;
    if (!ref.current) return;
    ref.current.position.set(
      startPos[0] + Math.sin(t * Math.PI * 3) * 0.3 * wobble.current,
      startPos[1] + t * 3.0,
      startPos[2]
    );
    ref.current.material.opacity = t < 0.15 ? t/0.15 : t > 0.65 ? 1-(t-0.65)/0.35 : 1;
    const s = 0.18 + Math.sin(t*Math.PI)*0.06;
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} position={startPos}>
      <planeGeometry args={[1,1]}/>
      <meshBasicMaterial transparent opacity={0} depthWrite={false}/>
      <Html center style={{pointerEvents:"none",userSelect:"none",fontSize:22,color:"#f5c880",filter:"drop-shadow(0 0 6px rgba(200,148,26,0.8))"}}>
        {note.current}
      </Html>
    </mesh>
  );
}

function StagePerformer() {
  const groupRef   = useRef();
  const headRef    = useRef();
  const bodyRef    = useRef();
  const leftArmRef = useRef();
  const rightArmRef= useRef();
  const leftLegRef = useRef();
  const saxRef     = useRef();
  const spotRef    = useRef();
  const t          = useRef(0);

  const STAGE_POS = [0, 0.7, -9.5];

  useFrame((_, dt) => {
    t.current += dt;
    const time = t.current;

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.35) * 0.18;
      groupRef.current.position.set(
        STAGE_POS[0] + Math.sin(time * 0.4) * 0.06,
        STAGE_POS[1],
        STAGE_POS[2]
      );
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.88 + Math.sin(time * 1.2) * 0.025;
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(time * 1.8) * 0.12;
      headRef.current.rotation.z = Math.sin(time * 0.7) * 0.04;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -1.1 + Math.sin(time * 1.8) * 0.06;
      rightArmRef.current.rotation.z = -0.5;
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -0.8 + Math.sin(time * 3.6) * 0.08;
      leftArmRef.current.rotation.z = 0.4;
    }
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(time * 3.6) > 0.5 ? -0.12 : 0;
    }
    if (saxRef.current) {
      saxRef.current.rotation.z = -0.4 + Math.sin(time * 0.7) * 0.05;
    }
    if (spotRef.current) {
      spotRef.current.intensity = 14 + Math.sin(time * 4.1) * 0.8;
    }
  });

  const gold  = <meshStandardMaterial color="#c8941a" roughness={0.55} metalness={0.1}/>;
  const skin  = <meshStandardMaterial color="#c8804a" roughness={0.7}/>;
  const suit  = <meshStandardMaterial color="#1a1a2e" roughness={0.6}/>;
  const shirt = <meshStandardMaterial color="#f5f0e8" roughness={0.7}/>;
  const pants = <meshStandardMaterial color="#0f0f1a" roughness={0.8}/>;
  const shoes = <meshStandardMaterial color="#0a0a0f" roughness={0.6} metalness={0.2}/>;

  const noteOrigin = [STAGE_POS[0]+0.3, STAGE_POS[1]+2.4, STAGE_POS[2]];

  return (
    <group>
      <spotLight
        ref={spotRef}
        position={[STAGE_POS[0], 9.5, STAGE_POS[2]+1]}
        target-position={STAGE_POS}
        angle={0.22}
        penumbra={0.4}
        intensity={14}
        color="#fff8e0"
        castShadow
      />
      <pointLight position={[STAGE_POS[0],2,STAGE_POS[2]+2]} color="#ff9922" intensity={2} distance={6} decay={2}/>
      {[0, 0.7, 1.4, 2.1, 2.8].map((delay, i) => (
        <MusicNote key={i} startPos={[...noteOrigin]} delay={delay}/>
      ))}
      <group ref={groupRef} position={STAGE_POS}>
        <mesh ref={bodyRef} position={[0,0.88,0]} castShadow>
          <boxGeometry args={[0.42,0.58,0.24]}/>{suit}
        </mesh>
        <mesh position={[0,0.90,0.12]} castShadow>
          <boxGeometry args={[0.18,0.46,0.02]}/>{shirt}
        </mesh>
        <mesh position={[0,1.12,0.13]}>
          <boxGeometry args={[0.1,0.05,0.02]}/>{gold}
        </mesh>
        <mesh ref={headRef} position={[0,1.42,0]} castShadow>
          <boxGeometry args={[0.28,0.29,0.28]}/>{skin}
        </mesh>
        <mesh position={[0,1.56,0]}>
          <boxGeometry args={[0.28,0.08,0.28]}/>
          <meshStandardMaterial color="#1a0800" roughness={0.9}/>
        </mesh>
        <mesh ref={rightArmRef} position={[0.3,0.92,-0.02]} castShadow rotation={[-1.1,0,-0.5]}>
          <boxGeometry args={[0.13,0.48,0.13]}/>{suit}
        </mesh>
        <mesh ref={leftArmRef} position={[-0.3,0.88,0.05]} castShadow rotation={[-0.8,0,0.4]}>
          <boxGeometry args={[0.13,0.48,0.13]}/>{suit}
        </mesh>
        <mesh position={[0.28,0.68,0.28]} castShadow>
          <boxGeometry args={[0.11,0.1,0.11]}/>{skin}
        </mesh>
        <mesh position={[-0.18,0.66,0.2]} castShadow>
          <boxGeometry args={[0.11,0.1,0.11]}/>{skin}
        </mesh>
        <group ref={saxRef} position={[0.15,0.8,0.18]}>
          <Saxophone/>
        </group>
        <mesh ref={leftLegRef} position={[-0.12,0.3,0]} castShadow>
          <boxGeometry args={[0.15,0.56,0.15]}/>{pants}
        </mesh>
        <mesh position={[0.12,0.3,0]} castShadow>
          <boxGeometry args={[0.15,0.56,0.15]}/>{pants}
        </mesh>
        <mesh position={[-0.12,0.02,0.05]} castShadow>
          <boxGeometry args={[0.16,0.07,0.26]}/>{shoes}
        </mesh>
        <mesh position={[0.12,0.02,0.05]} castShadow>
          <boxGeometry args={[0.16,0.07,0.26]}/>{shoes}
        </mesh>
        <mesh position={[0.14,1.01,0.12]}>
          <sphereGeometry args={[0.025,6,6]}/>{gold}
        </mesh>
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.69,0]}>
          <circleGeometry args={[0.38,24]}/>
          <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false}/>
        </mesh>
      </group>
      <group position={[0, 0.72, -8.2]}>
        <mesh>
          <boxGeometry args={[2.2,0.04,0.5]}/>
          <meshStandardMaterial color="#1a0e04" roughness={0.5} metalness={0.3}/>
        </mesh>
        <Html position={[0,0.06,0]} center>
          <div style={{
            color:"#f5c880", fontSize:11, fontWeight:700,
            letterSpacing:"0.2em", textTransform:"uppercase",
            fontFamily:"'Playfair Display',serif",
            textShadow:"0 0 12px rgba(200,148,26,0.8)",
            whiteSpace:"nowrap",
            pointerEvents:"none",
          }}>
            ♪ The Performer ♪
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   FULL CLUB SCENE
═══════════════════════════════════════════════════════════ */
function JazzClub({ myPosRef, onSit, seatMap, myChairId }) {
  const [nearbyChairId, setNearbyChairId] = useState(null);

  useFrame(() => {
    if (!myPosRef?.current) return;
    const px = myPosRef.current.x;
    const pz = myPosRef.current.z;
    let closest = null, minDist = 1.4;
    ALL_CHAIRS.forEach(c => {
      const dx = px - c.pos[0], dz = pz - c.pos[2];
      const d  = Math.sqrt(dx*dx + dz*dz);
      if (d < minDist) { minDist = d; closest = c.id; }
    });
    setNearbyChairId(closest);
    myPosRef.current.nearbyChairId = closest;
  });

  return (
    <group>
      <Floor/>
      <Walls/>
      <Stage/>
      <Bar/>
      {TABLE_POSITIONS.map((p,i) => <TableMesh key={i} pos={p}/>)}
      {ALL_CHAIRS.map(chair => (
        <ChairMesh
          key={chair.id}
          chairData={chair}
          onSit={onSit}
          isOccupied={!!seatMap[chair.id] && seatMap[chair.id] !== socket.id}
          isMyChair={myChairId === chair.id}
          isNearby={nearbyChairId === chair.id && myChairId !== chair.id}
        />
      ))}
      {[[-12.6,4,-8],[-12.6,4,0],[-12.6,4,8],[12.6,4,-8],[12.6,4,0],[12.6,4,8],
        [-4,4,-12.6],[0,4,-12.6],[4,4,-12.6]].map((p,i)=>(
        <WallSconce key={i} pos={p}/>
      ))}
      {[[-5,-5],[-5,0],[-5,5],[0,-5],[0,5],[5,-5],[5,0],[5,5]].map(([x,z],i)=>(
        <group key={i} position={[x,9.7,z]}>
          <mesh><cylinderGeometry args={[0.06,0.06,0.5,8]}/><meshStandardMaterial color="#888" metalness={0.9}/></mesh>
          <mesh position={[0,-0.45,0]}>
            <sphereGeometry args={[0.18,10,10]}/>
            <meshBasicMaterial color="#ffe8a0"/>
          </mesh>
          <pointLight position={[0,-0.6,0]} color="#fff5dc" intensity={4} distance={12} decay={2}/>
        </group>
      ))}
      <spotLight position={[0,9,-5]} angle={0.38} penumbra={0.25}
        intensity={15} color="#fff8e0" castShadow target-position={[0,0.7,-10]}/>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   MY AVATAR
═══════════════════════════════════════════════════════════ */
function MyAvatar({ posRef }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current || !posRef?.current) return;
    const p = posRef.current;
    groupRef.current.position.set(p.x, 0, p.z);
    groupRef.current.rotation.y = p.rotY ?? 0;
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.012,0]}>
        <circleGeometry args={[0.32,20]}/>
        <meshBasicMaterial color="#000" transparent opacity={0.28} depthWrite={false}/>
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   REMOTE AVATAR
═══════════════════════════════════════════════════════════ */
function RemoteAvatar({ position, color, seated, speaking }) {
  const groupRef = useRef();
  const cur      = useRef(new THREE.Vector3(...position));
  const rotRef   = useRef(0);
  const walk     = useRef(0);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const tgt = new THREE.Vector3(...position);
    const dist = cur.current.distanceTo(tgt);
    const moving = dist > 0.05 && !seated;

    if (moving) {
      const dir   = new THREE.Vector3().subVectors(tgt, cur.current).normalize();
      const angle = Math.atan2(dir.x, dir.z);
      const diff  = ((angle - rotRef.current + Math.PI) % (Math.PI*2)) - Math.PI;
      rotRef.current += diff * Math.min(dt*10, 1);
      cur.current.lerp(tgt, Math.min(dt*5, 1));
      walk.current += dt*9;
    } else {
      walk.current *= 0.8;
      if (seated) cur.current.copy(tgt);
    }

    const sy = seated ? SEAT_H - 0.45 : 0;
    groupRef.current.position.set(cur.current.x, sy, cur.current.z);
    groupRef.current.rotation.y = rotRef.current;

    const sw = Math.sin(walk.current)*(moving?0.5:0.04);
    const bounce = Math.abs(Math.sin(walk.current))*(moving?0.045:0);
    const c = groupRef.current.children;
    if (seated) {
      if(c[0]) c[0].position.y = 0.88;
      if(c[4]) { c[4].rotation.x = -Math.PI/2.5; c[4].position.z = 0.25; }
      if(c[5]) { c[5].rotation.x = -Math.PI/2.5; c[5].position.z = 0.25; }
      if(c[2]) { c[2].rotation.x = Math.PI/6; }
      if(c[3]) { c[3].rotation.x = Math.PI/6; }
    } else {
      if(c[0]) c[0].position.y = 0.88+bounce;
      if(c[2]) { c[2].rotation.x =  sw; c[2].position.z=0; }
      if(c[3]) { c[3].rotation.x = -sw; c[3].position.z=0; }
      if(c[4]) { c[4].rotation.x = -sw*0.9; c[4].position.z=0; }
      if(c[5]) { c[5].rotation.x =  sw*0.9; c[5].position.z=0; }
    }
  });

  const body = <meshStandardMaterial color={color} roughness={0.55}/>;
  const skin = <meshStandardMaterial color="#d4a07a" roughness={0.7}/>;
  const pant = <meshStandardMaterial color="#1a1a3a" roughness={0.85}/>;

  return (
    <>
      <group ref={groupRef}>
        <mesh position={[0,0.88,0]} castShadow><boxGeometry args={[0.38,0.55,0.22]}/>{body}</mesh>
        <mesh position={[0,1.42,0]} castShadow><boxGeometry args={[0.27,0.27,0.27]}/>{skin}</mesh>
        <mesh position={[-0.29,0.86,0]} castShadow><boxGeometry args={[0.12,0.46,0.12]}/>{body}</mesh>
        <mesh position={[ 0.29,0.86,0]} castShadow><boxGeometry args={[0.12,0.46,0.12]}/>{body}</mesh>
        <mesh position={[-0.11,0.29,0]} castShadow><boxGeometry args={[0.14,0.55,0.14]}/>{pant}</mesh>
        <mesh position={[ 0.11,0.29,0]} castShadow><boxGeometry args={[0.14,0.55,0.14]}/>{pant}</mesh>
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.011,0]}>
          <circleGeometry args={[0.3,20]}/>
          <meshBasicMaterial color="#000" transparent opacity={0.22} depthWrite={false}/>
        </mesh>
      </group>
      {speaking && <SpeakingRing position={[...position]}/>}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   PLAYER CONTROLLER — WASD + mouse-look (unchanged from original)
═══════════════════════════════════════════════════════════ */
function PlayerController({ posRef, roomId, avatarType, onLocked, onSitFromKey, onToggleMic, onToggleMusic }) {
  const { camera } = useThree();
  const keys       = useRef({});
  const yaw        = useRef(Math.PI);
  const pitch      = useRef(0.0);
  const locked     = useRef(false);
  const lastEmit   = useRef(0);

  useEffect(() => {
    const kd = (e) => {
      keys.current[e.code] = true;
      if (e.code === "KeyE")   { onSitFromKey(); }
      if (e.code === "KeyM")   { e.preventDefault(); onToggleMic(); }
      if (e.code === "Space")  { e.preventDefault(); onToggleMusic(); }
    };
    const ku = (e) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup",   ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, [onSitFromKey, onToggleMic, onToggleMusic]);

  useEffect(() => {
    const onChange = () => {
      const isLocked = document.pointerLockElement === document.body;
      locked.current = isLocked;
      onLocked(isLocked);
      if (!isLocked) {
        document.body.style.cursor = "auto";
        document.documentElement.style.cursor = "auto";
      }
    };
    const onMove = (e) => {
      if (!locked.current) return;
      yaw.current   -= e.movementX * 0.002;
      pitch.current  = Math.max(-1.2, Math.min(1.2, pitch.current - e.movementY * 0.0025));
    };
    document.addEventListener("pointerlockchange", onChange);
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("pointerlockchange", onChange);
      document.removeEventListener("mousemove", onMove);
    };
  }, [onLocked]);

  useFrame((_, dt) => {
    const p = posRef.current;
    const seated = !!p.seated;

    if (!seated) {
      const fw = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
      const rt = new THREE.Vector3( Math.cos(yaw.current), 0, -Math.sin(yaw.current));
      const mv = new THREE.Vector3();
      const k  = keys.current;
      if (k["KeyW"]||k["ArrowUp"])    mv.addScaledVector(fw,  1);
      if (k["KeyS"]||k["ArrowDown"])  mv.addScaledVector(fw, -1);
      if (k["KeyA"]||k["ArrowLeft"])  mv.addScaledVector(rt, -1);
      if (k["KeyD"]||k["ArrowRight"]) mv.addScaledVector(rt,  1);
      const moving = mv.lengthSq() > 0;
      p.moving = moving;
      if (moving) {
        mv.normalize().multiplyScalar(WALK_SPD * dt);
        p.x = Math.max(-BOUNDS, Math.min(BOUNDS, p.x + mv.x));
        p.z = Math.max(-BOUNDS, Math.min(BOUNDS, p.z + mv.z));
      }
    } else {
      p.moving = false;
    }

    const eyeY = seated ? SEAT_H + 0.52 : 1.55;
    camera.position.set(p.x, eyeY, p.z);

    const lookDir = new THREE.Vector3(
      -Math.sin(yaw.current) * Math.cos(pitch.current),
       Math.sin(pitch.current),
      -Math.cos(yaw.current) * Math.cos(pitch.current)
    );
    camera.lookAt(
      p.x + lookDir.x,
      eyeY + lookDir.y,
      p.z + lookDir.z
    );

    p.rotY = yaw.current + Math.PI;

    const now = performance.now();
    if (now - lastEmit.current > 50) {
      lastEmit.current = now;
      socket.emit("playerMove", {
        roomId,
        position: [p.x, 0, p.z],
        avatarType,
        seated: !!p.seated,
        chairId: p.chairId || null,
      });
    }
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════
   ★ CARDBOARD CAMERA CONTROLLER (mobile-only addition)
   Reads device orientation quaternion from useVR headPose
   and applies it to the Three.js camera every frame.
═══════════════════════════════════════════════════════════ */
function CardboardCameraController({ posRef, headPose, roomId, avatarType }) {
  const { camera } = useThree();
  const lastEmit   = useRef(0);
  const yawOffset  = useRef(Math.PI);

  useFrame((_, dt) => {
    const p = posRef.current;
    const seated = !!p.seated;

    // Movement from mobile joystick written to posRef.mobileMove
    if (!seated && p.mobileMove) {
      const { dx, dz } = p.mobileMove;
      const fw = new THREE.Vector3(-Math.sin(yawOffset.current), 0, -Math.cos(yawOffset.current));
      const rt = new THREE.Vector3( Math.cos(yawOffset.current), 0, -Math.sin(yawOffset.current));
      p.x = Math.max(-BOUNDS, Math.min(BOUNDS, p.x + (fw.x * dz + rt.x * dx) * WALK_SPD * dt));
      p.z = Math.max(-BOUNDS, Math.min(BOUNDS, p.z + (fw.z * dz + rt.z * dx) * WALK_SPD * dt));
    }

    const eyeY = seated ? SEAT_H + 0.52 : 1.55;
    camera.position.set(p.x, eyeY, p.z);

    // Apply device orientation quaternion if available
    if (headPose && headPose.current) {
      const [qx, qy, qz, qw] = headPose.current.quaternion;
      camera.quaternion.set(qx, qy, qz, qw);
    }

    p.rotY = yawOffset.current + Math.PI;

    const now = performance.now();
    if (now - lastEmit.current > 50) {
      lastEmit.current = now;
      socket.emit("playerMove", {
        roomId,
        position: [p.x, 0, p.z],
        avatarType,
        seated: !!p.seated,
        chairId: p.chairId || null,
      });
    }
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════
   ★ MOBILE JOYSTICK (Cardboard mode only)
═══════════════════════════════════════════════════════════ */
function MobileJoystick({ posRef }) {
  const baseRef    = useRef(null);
  const stickRef   = useRef(null);
  const activeTouch= useRef(null);
  const originRef  = useRef({ x:0, y:0 });
  const RADIUS     = 48;

  const updateStick = useCallback((cx, cy) => {
    const ox = cx - originRef.current.x;
    const oy = cy - originRef.current.y;
    const len = Math.sqrt(ox*ox + oy*oy);
    const clamped = Math.min(len, RADIUS);
    const angle = Math.atan2(oy, ox);
    const sx = Math.cos(angle) * clamped;
    const sy = Math.sin(angle) * clamped;
    if (stickRef.current) {
      stickRef.current.style.transform = `translate(${sx}px,${sy}px)`;
    }
    if (posRef?.current) {
      posRef.current.mobileMove = { dx: sx / RADIUS, dz: -sy / RADIUS };
    }
  }, [posRef]);

  const onTouchStart = useCallback((e) => {
    if (activeTouch.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouch.current = touch.identifier;
    const rect = baseRef.current.getBoundingClientRect();
    originRef.current = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
    updateStick(touch.clientX, touch.clientY);
  }, [updateStick]);

  const onTouchMove = useCallback((e) => {
    for (const touch of e.changedTouches) {
      if (touch.identifier === activeTouch.current) {
        updateStick(touch.clientX, touch.clientY);
      }
    }
  }, [updateStick]);

  const onTouchEnd = useCallback((e) => {
    for (const touch of e.changedTouches) {
      if (touch.identifier === activeTouch.current) {
        activeTouch.current = null;
        if (stickRef.current) stickRef.current.style.transform = "translate(0,0)";
        if (posRef?.current) posRef.current.mobileMove = null;
      }
    }
  }, [posRef]);

  return (
    <div
      ref={baseRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      style={{
        position:"absolute", bottom:36, left:36,
        width:RADIUS*2, height:RADIUS*2,
        borderRadius:"50%",
        background:"rgba(245,200,128,0.18)",
        border:"2px solid rgba(245,200,128,0.5)",
        display:"flex", alignItems:"center", justifyContent:"center",
        touchAction:"none", userSelect:"none", zIndex:30,
      }}
    >
      <div
        ref={stickRef}
        style={{
          width:RADIUS*0.7, height:RADIUS*0.7,
          borderRadius:"50%",
          background:"rgba(245,200,128,0.7)",
          border:"2px solid #f5c880",
          transition:"transform 0.05s",
          pointerEvents:"none",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ★ CARDBOARD CONNECTED POPUP (mobile-only addition)
═══════════════════════════════════════════════════════════ */
function CardboardConnectedPopup({ onDismiss }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDismiss?.(); }, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  if (!visible) return null;
  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, zIndex:200,
      display:"flex", justifyContent:"center", padding:"18px 16px 0",
      pointerEvents:"none",
    }}>
      <div style={{
        background:"rgba(8,4,1,0.96)", border:"1.5px solid #c8941a",
        borderRadius:14, padding:"14px 22px", maxWidth:340,
        display:"flex", flexDirection:"column", gap:8, alignItems:"center",
        boxShadow:"0 4px 32px rgba(200,148,26,0.25)",
      }}>
        <div style={{fontSize:28}}>📦</div>
        <div style={{color:"#f5c880", fontWeight:700, fontSize:14, letterSpacing:1}}>
          Google Cardboard Mode
        </div>
        <div style={{color:"#c8941a", fontSize:12, textAlign:"center", lineHeight:1.5}}>
          Place your phone in your Cardboard viewer.<br/>
          Tilt your head to look around.<br/>
          Use the joystick to walk.
        </div>
        <div style={{color:"#6b4a1a", fontSize:11}}>Auto-dismisses in 5 seconds…</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLOATING EMOJI IN 3D SPACE
═══════════════════════════════════════════════════════════ */
function FloatingEmoji3D({ emoji, x, z }) {
  const ref = useRef();
  const age = useRef(0);
  const DURATION = 3.0;

  useFrame((_, dt) => {
    age.current += dt;
    if (!ref.current) return;
    const t = Math.min(age.current / DURATION, 1);
    ref.current.position.set(x, 1.8 + t * 2.2, z);
    ref.current.material.opacity = t < 0.15 ? t/0.15 : t > 0.7 ? 1-(t-0.7)/0.3 : 1;
    const s = 0.5 + Math.sin(age.current * 4) * 0.08;
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} position={[x, 1.8, z]}>
      <planeGeometry args={[0.6, 0.6]}/>
      <meshBasicMaterial transparent depthWrite={false} color="#ffffff" opacity={0}/>
      <Html center style={{ pointerEvents:"none", userSelect:"none" }}>
        <div style={{ fontSize:36, filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.8))",
          animation:"emojiPop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
          {emoji}
        </div>
      </Html>
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════
   SPEAKING RING
═══════════════════════════════════════════════════════════ */
function SpeakingRing({ position }) {
  const ref = useRef();
  const t   = useRef(0);
  useFrame((_, dt) => {
    t.current += dt * 5;
    if (ref.current) {
      const s = 1 + Math.sin(t.current) * 0.18;
      ref.current.scale.setScalar(s);
      ref.current.material.opacity = 0.5 + Math.sin(t.current) * 0.3;
    }
  });
  return (
    <mesh ref={ref} position={[position[0], 2.1, position[2]]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[0.22, 0.32, 28]}/>
      <meshBasicMaterial color="#6ee7b7" transparent opacity={0.7} depthWrite={false}/>
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMOJI REACTION BAR
═══════════════════════════════════════════════════════════ */
const REACTION_EMOJIS = ["👍","❤️","😂","🎉","🔥","👏","😮","🎷","💃","🤝"];

function EmojiBar({ onEmoji, locked }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (locked) setOpen(false); }, [locked]);

  return (
    <div style={{
      position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)",
      zIndex:150, fontFamily:"system-ui", display:"flex", flexDirection:"column",
      alignItems:"center", gap:8,
    }}>
      {open && (
        <div style={{
          background:"rgba(5,2,0,0.92)", backdropFilter:"blur(16px)",
          border:"1px solid rgba(200,148,26,0.3)", borderRadius:16,
          padding:"10px 14px", display:"flex", gap:6, flexWrap:"wrap",
          maxWidth:300, justifyContent:"center",
          animation:"slideUp 0.2s ease",
        }}>
          {REACTION_EMOJIS.map(em => (
            <button key={em} onClick={(e) => { e.stopPropagation(); onEmoji(em); setOpen(false); }}
              style={{
                background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:10, width:42, height:42, fontSize:22, cursor:"pointer",
                transition:"transform .12s, background .12s",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="scale(1.3)"; e.currentTarget.style.background="rgba(200,148,26,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="scale(1)";   e.currentTarget.style.background="rgba(255,255,255,0.06)"; }}
            >{em}</button>
          ))}
        </div>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v=>!v); }}
        style={{
          background: open ? "rgba(200,148,26,0.22)" : "rgba(5,2,0,0.88)",
          backdropFilter:"blur(16px)",
          border:`1px solid ${open?"rgba(200,148,26,0.5)":"rgba(200,148,26,0.15)"}`,
          borderRadius:12, padding:"9px 18px", color: open?"#f5c880":"#6b4a1a",
          fontSize:12, fontWeight:600, cursor:"pointer",
          fontFamily:"'DM Sans',system-ui",
          display:"flex", alignItems:"center", gap:7, transition:"all .2s",
          boxShadow: open ? "0 0 24px rgba(200,148,26,0.25)" : "none",
          letterSpacing:"0.04em",
        }}
        onMouseEnter={e=>{if(!open){e.currentTarget.style.borderColor="rgba(200,148,26,0.35)";e.currentTarget.style.color="#c8941a";}}}
        onMouseLeave={e=>{if(!open){e.currentTarget.style.borderColor="rgba(200,148,26,0.15)";e.currentTarget.style.color="#6b4a1a";}}}
      >
        <span style={{fontSize:16}}>😊</span>
        Reactions
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MIC BUTTON
═══════════════════════════════════════════════════════════ */
function MicButton({ active, onToggle }) {
  return (
    <div style={{
      position:"fixed", bottom:20, left:20, zIndex:150, display:"flex", flexDirection:"column", alignItems:"center",
      fontFamily:"system-ui",
    }}>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        style={{
          width:48, height:48, borderRadius:12,
          background: active
            ? "linear-gradient(135deg,rgba(239,68,68,0.3),rgba(239,68,68,0.15))"
            : "rgba(5,2,0,0.88)",
          backdropFilter:"blur(16px)",
          border:`1.5px solid ${active ? "rgba(239,68,68,0.6)" : "rgba(200,148,26,0.18)"}`,
          cursor:"pointer", fontSize:20,
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all .2s",
          boxShadow: active
            ? "0 0 24px rgba(239,68,68,0.5), 0 0 60px rgba(239,68,68,0.2)"
            : "0 4px 16px rgba(0,0,0,0.4)",
          animation: active ? "micPulse 1.8s ease-in-out infinite" : "none",
        }}
        title={active ? "Mute mic — press M" : "Unmute mic — press M"}
      >
        {active ? "🎙️" : "🎤"}
      </button>
      {active && (
        <div style={{
          position:"absolute", bottom:-18, left:"50%", transform:"translateX(-50%)",
          fontSize:9, color:"#ef4444", fontWeight:800, whiteSpace:"nowrap",
          letterSpacing:"0.15em", textTransform:"uppercase",
          display:"flex",alignItems:"center",gap:4,
        }}>
          <div style={{width:5,height:5,borderRadius:"50%",background:"#ef4444",animation:"glowPulse 0.8s ease-in-out infinite"}}/>
          LIVE
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MUSIC PLAYER UI
═══════════════════════════════════════════════════════════ */
function MusicPlayer({ controlRef }) {
  const audioRef    = useRef(null);
  const [trackIdx,  setTrackIdx]  = useState(0);
  const [playing,   setPlaying]   = useState(false);
  const [volume,    setVolume]    = useState(0.35);
  const [progress,  setProgress]  = useState(0);
  const [duration,  setDuration]  = useState(0);
  const [expanded,  setExpanded]  = useState(false);

  const track = TRACKS[trackIdx];

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = track.url;
    audioRef.current.load();
    if (playing) audioRef.current.play().catch(()=>{});
  }, [trackIdx]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().catch(()=>{}); setPlaying(true); }
  };

  useEffect(() => {
    if (controlRef) controlRef.current = { togglePlay };
  });

  const nextTrack = () => setTrackIdx(i => (i+1) % TRACKS.length);
  const prevTrack = () => setTrackIdx(i => (i-1+TRACKS.length) % TRACKS.length);

  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  const onEnded = () => nextTrack();

  const seek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s/60), sec = Math.floor(s%60);
    return `${m}:${sec.toString().padStart(2,"0")}`;
  };

  const pct = duration ? (progress/duration)*100 : 0;

  const btnStyle = {
    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(200,148,26,0.2)",
    borderRadius:8, color:"#f5c880", fontSize:12, width:28, height:28,
    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
    padding:0,
  };

  return (
    <>
      <audio ref={audioRef} onTimeUpdate={onTimeUpdate} onEnded={onEnded}/>
      <div style={{
        position:"fixed", bottom:20, right:20, zIndex:200,
        fontFamily:"system-ui,sans-serif", userSelect:"none",
        width: expanded ? 320 : 240,
        background:"rgba(8,4,1,0.96)", backdropFilter:"blur(24px)",
        border:"1px solid rgba(200,148,26,0.22)", borderRadius:14,
        overflow:"hidden", transition:"width .3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow:"0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,148,26,0.06)",
      }}>
        <div style={{
          display:"flex", alignItems:"center", gap:10, padding:"12px 16px",
          cursor:"pointer",
          borderBottom: expanded?"1px solid rgba(200,148,26,0.12)":"none",
          background:"rgba(200,148,26,0.04)",
        }} onClick={() => setExpanded(v=>!v)}>
          <div style={{
            width:34, height:34, borderRadius:"50%",
            background:"radial-gradient(circle at 40% 40%, #3a2a1a, #0a0603)",
            border:"2px solid #c8941a",
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0,
            animation: playing ? "spin 3s linear infinite" : "none",
          }}>
            <div style={{width:8, height:8, borderRadius:"50%", background:"#c8941a"}}/>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:12, fontWeight:700, color:"#f5c880", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:"'Playfair Display',serif", letterSpacing:"0.02em"}}>
              {playing ? "♫ " : ""}{track.title}
            </div>
            <div style={{fontSize:10, color:"#6b4a1a"}}>{track.artist}</div>
          </div>
          <div style={{color:"#6b4a1a", fontSize:11}}>{expanded?"▲":"▼"}</div>
        </div>
        <div style={{
          height:3, background:"#2a1a0a", cursor:"pointer", margin:"0 14px 10px",
        }} onClick={seek}>
          <div style={{height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#f5c880,#ff9933)", borderRadius:2, transition:"width .5s linear"}}/>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:8, padding:"0 14px 12px"}}>
          <button onClick={prevTrack} style={btnStyle}>⏮</button>
          <button onClick={togglePlay} style={{
            ...btnStyle, width:34, height:34, fontSize:16,
            background:"rgba(200,148,26,0.2)", border:"1px solid rgba(200,148,26,0.4)",
          }}>{playing ? "⏸" : "▶"}</button>
          <button onClick={nextTrack} style={btnStyle}>⏭</button>
          <div style={{flex:1}}/>
          <span style={{fontSize:10, color:"#6b4a1a"}}>{fmt(progress)}</span>
        </div>
        {expanded && (
          <div style={{padding:"0 14px 14px"}}>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:14}}>
              <span style={{fontSize:12, color:"#6b4a1a"}}>🔊</span>
              <div style={{flex:1, height:3, background:"#2a1a0a", borderRadius:2, cursor:"pointer", position:"relative"}}
                onClick={(e)=>{
                  const r = e.currentTarget.getBoundingClientRect();
                  const v = Math.max(0, Math.min(1, (e.clientX-r.left)/r.width));
                  setVolume(v);
                  if (audioRef.current) audioRef.current.volume = v;
                }}>
                <div style={{height:"100%", width:`${volume*100}%`, background:"linear-gradient(90deg,#f5c880,#ff9933)", borderRadius:2}}/>
                <div style={{
                  position:"absolute", top:"50%", left:`${volume*100}%`,
                  transform:"translate(-50%,-50%)",
                  width:10, height:10, borderRadius:"50%",
                  background:"#f5c880", boxShadow:"0 0 6px #f5c880",
                }}/>
              </div>
            </div>
            <div style={{fontSize:10, color:"#6b4a1a", marginBottom:8, letterSpacing:1, textTransform:"uppercase"}}>Playlist</div>
            {TRACKS.map((t, i) => (
              <div key={i} onClick={() => { setTrackIdx(i); setPlaying(true); setTimeout(()=>{ if(audioRef.current) audioRef.current.play().catch(()=>{}); },100); }}
                style={{
                  display:"flex", alignItems:"center", gap:8, padding:"6px 8px",
                  borderRadius:8, cursor:"pointer", marginBottom:2,
                  background: i===trackIdx ? "rgba(200,148,26,0.15)" : "transparent",
                  border: i===trackIdx ? "1px solid rgba(200,148,26,0.25)" : "1px solid transparent",
                  transition:"all .15s",
                }}>
                <div style={{
                  width:20, height:20, borderRadius:"50%",
                  background: i===trackIdx ? "rgba(200,148,26,0.3)" : "rgba(255,255,255,0.04)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:9, color:"#f5c880",
                }}>{i===trackIdx && playing ? "♫" : (i+1)}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11, color: i===trackIdx ? "#f5c880" : "#8b6a3a", fontWeight: i===trackIdx ? 700:400}}>{t.title}</div>
                  <div style={{fontSize:9, color:"#4a3a1a"}}>{t.artist}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════ */
export default function Room3D() {
  const { roomId } = useParams();
  const navigate   = useNavigate();

  const userId     = useRef(localStorage.getItem("userId") || `guest-${Math.random().toString(36).slice(2,6)}`);
  const avatarType = localStorage.getItem("avatarType") || "male";

  const myPosRef = useRef(Object.assign(
    new THREE.Vector3(...SPAWN),
    { rotY: Math.PI, moving: false, seated: false, chairId: null, nearbyChairId: null, mobileMove: null }
  ));

  const [players,       setPlayers]       = useState({});
  const [seatMap,       setSeatMap]       = useState({});
  const [myChairId,     setMyChairId]     = useState(null);
  const [locked,        setLocked]        = useState(false);
  const [playerCount,   setPlayerCount]   = useState(1);

  // ── VR state ──
  const [vrPopupVisible,        setVrPopupVisible]        = useState(false);
  const [showCardboardPopup,    setShowCardboardPopup]    = useState(false); // ★ NEW

  const { vrSupported, vrConnected, enterVR, exitVR,
          headPose, leftHand, rightHand, setRenderer} = useVR({
    onConnected:    () => setVrPopupVisible(true),
    onDisconnected: () => setVrPopupVisible(false),
  });

  // ★ NEW: Cardboard state — detected on mobile via DeviceOrientationEvent
  const [cardboardConnected, setCardboardConnected] = useState(false);

  // Detect mobile
  const isMobile = useMemo(() =>
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent), []);

  // ★ NEW: Enter Cardboard (mobile only) — requests device orientation permission + activates mode
  const handleEnterCardboard = useCallback(async () => {
    // iOS 13+ requires permission
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== "granted") return;
      } catch {
        return;
      }
    }
    setCardboardConnected(true);
    setShowCardboardPopup(true);
  }, []);

  // ★ NEW: Exit Cardboard
  const handleExitCardboard = useCallback(() => {
    setCardboardConnected(false);
    setShowCardboardPopup(false);
    if (myPosRef.current) myPosRef.current.mobileMove = null;
  }, []);

  // Keyboard VR toggle (Press V) — unchanged from original
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "KeyV") {
        if (!vrSupported) return;
        if (!vrConnected) enterVR();
        else exitVR();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [vrSupported, vrConnected, enterVR, exitVR]);

  const [floatingEmojis,  setFloatingEmojis]  = useState([]);
  const [micActive,       setMicActive]       = useState(false);
  const [speakingPlayers, setSpeakingPlayers] = useState({});
  const micStreamRef    = useRef(null);
  const musicControlRef = useRef(null);
  const peerConns       = useRef({});
  const localStream     = useRef(null);
  const emojiIdRef      = useRef(0);

  const colorMap  = useRef({});
  const colorIdx  = useRef(0);
  const getColor  = useCallback((sid) => {
    if (!colorMap.current[sid]) {
      colorMap.current[sid] = AVATAR_COLORS[colorIdx.current % AVATAR_COLORS.length];
      colorIdx.current++;
    }
    return colorMap.current[sid];
  }, []);

  /* ── Sit / Stand logic ── */
  const handleSit = useCallback((chairData) => {
    const p = myPosRef.current;
    if (p.seated && p.chairId === chairData.id) {
      p.seated  = false;
      p.chairId = null;
      setMyChairId(null);
      socket.emit("standUp", { roomId, chairId: chairData.id });
    } else if (!seatMap[chairData.id]) {
      p.x       = chairData.pos[0];
      p.z       = chairData.pos[2];
      p.rotY    = chairData.faceAngle;
      p.seated  = true;
      p.chairId = chairData.id;
      setMyChairId(chairData.id);
      socket.emit("takeSeat", { roomId, chairId: chairData.id, socketId: socket.id });
    }
  }, [roomId, seatMap]);

  const handleSitFromKey = useCallback(() => {
    const p = myPosRef.current;
    if (p.seated) {
      const chair = ALL_CHAIRS.find(c => c.id === p.chairId);
      if (chair) handleSit(chair);
    } else if (p.nearbyChairId) {
      const chair = ALL_CHAIRS.find(c => c.id === p.nearbyChairId);
      if (chair) handleSit(chair);
    }
  }, [handleSit]);

  /* ── Socket ── */
  useEffect(() => {
    const uid = userId.current;
    socket.emit("joinRoom", { roomId, userId: uid, avatarType });

    socket.on("seatState",  (map) => setSeatMap(map || {}));
    socket.on("seatUpdate", (map) => setSeatMap(map || {}));

    socket.on("roomState", (state) => {
      const next = {};
      Object.entries(state).forEach(([sid, d]) => {
        if (sid !== socket.id)
          next[sid] = { pos: d.position||SPAWN, color: getColor(sid), seated: d.seated, chairId: d.chairId };
      });
      setPlayers(next);
      setPlayerCount(Object.keys(next).length + 1);
      const sm = {};
      Object.entries(state).forEach(([sid, d]) => { if(d.chairId) sm[d.chairId] = sid; });
      setSeatMap(sm);
    });

    socket.on("playerJoined", ({ socketId, position }) => {
      setPlayers(prev => {
        const n = { ...prev, [socketId]: { pos: position||SPAWN, color: getColor(socketId), seated:false } };
        setPlayerCount(Object.keys(n).length+1);
        return n;
      });
    });

    socket.on("playerMoved", ({ socketId, position, seated, chairId }) => {
      setPlayers(prev => ({
        ...prev,
        [socketId]: { ...(prev[socketId]||{color:getColor(socketId)}), pos: position, seated, chairId },
      }));
      if (chairId) {
        setSeatMap(prev => ({ ...prev, [chairId]: socketId }));
      }
    });

    socket.on("playerLeft", ({ socketId }) => {
      setPlayers(prev => {
        const n = { ...prev }; delete n[socketId];
        setPlayerCount(Object.keys(n).length+1);
        return n;
      });
      setSeatMap(prev => {
        const n = { ...prev };
        Object.keys(n).forEach(k => { if (n[k]===socketId) delete n[k]; });
        return n;
      });
    });

    socket.on("playerStoodUp", ({ socketId, chairId }) => {
      setSeatMap(prev => { const n={...prev}; delete n[chairId]; return n; });
    });

    socket.on("emojiReaction", ({ socketId, emoji }) => {
      setPlayers(currentPlayers => {
        const player = currentPlayers[socketId];
        const pos = player?.pos || [0,0,0];
        const id = ++emojiIdRef.current;
        setFloatingEmojis(prev => [...prev.slice(-20), { id, emoji, x: pos[0], z: pos[2] }]);
        setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 3200);
        return currentPlayers;
      });
    });

    socket.on("playerSpeaking", ({ socketId, speaking }) => {
      setSpeakingPlayers(prev => ({ ...prev, [socketId]: speaking }));
    });

    return () => {
      ["seatState","seatUpdate","roomState","playerJoined","playerMoved","playerLeft","playerStoodUp","emojiReaction","playerSpeaking"]
        .forEach(ev => socket.off(ev));
    };
  }, [roomId, avatarType, getColor]);

  /* ── Send emoji ── */
  const sendEmoji = useCallback((emoji) => {
    const p = myPosRef.current;
    socket.emit("emojiReaction", { roomId, emoji });
    const id = ++emojiIdRef.current;
    setFloatingEmojis(prev => [...prev.slice(-20), { id, emoji, x: p.x, z: p.z, isMe: true }]);
    setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 3200);
  }, [roomId]);

  /* ── Mic toggle ── */
  const toggleMic = useCallback(async () => {
    if (micActive) {
      if (localStream.current) {
        localStream.current.getTracks().forEach(t => t.stop());
        localStream.current = null;
      }
      Object.values(peerConns.current).forEach(pc => pc.close());
      peerConns.current = {};
      setMicActive(false);
      socket.emit("playerSpeaking", { roomId, speaking: false });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStream.current = stream;
        setMicActive(true);
        socket.emit("playerSpeaking", { roomId, speaking: true });
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        const buf = new Uint8Array(analyser.frequencyBinCount);
        let vadTimer;
        const checkVAD = () => {
          analyser.getByteFrequencyData(buf);
          const avg = buf.reduce((a,b)=>a+b,0)/buf.length;
          socket.emit("playerSpeaking", { roomId, speaking: avg > 18 });
          vadTimer = requestAnimationFrame(checkVAD);
        };
        vadTimer = requestAnimationFrame(checkVAD);
        stream.addEventListener("inactive", () => cancelAnimationFrame(vadTimer));
      } catch (err) {
        alert("Microphone access denied. Please allow mic access to use voice chat.");
      }
    }
  }, [micActive, roomId]);

  const requestLock = useCallback(() => document.body.requestPointerLock(), []);

  return (
    <div style={{ width:"100vw", height:"100vh", background:"#080401", cursor: locked ? "none" : "auto", position:"relative" }}>

      {/* Enter VR Button (top-right, shown outside overlay too) */}
      {vrSupported && !vrConnected && (
        <button
          onClick={enterVR}
          style={{
            position:"fixed", top:20, right:20, zIndex:999,
            padding:"10px 16px", background:"#000", color:"#fff",
            borderRadius:"8px", cursor:"pointer",
          }}
        >
          Enter VR 🥽
        </button>
      )}

      {/* ════ 3D CANVAS ════ */}
      <Canvas shadows camera={{ position:[0,1.55,6], fov:80 }}
      onCreated={({ gl }) => {
    gl.xr.enabled = true;   // ★ enable XR on the renderer
    setRenderer(gl);}}
    >
        <ambientLight intensity={1.4} color="#fff8f0"/>
        <directionalLight position={[4,8,4]} intensity={2.0} color="#fff8e0" castShadow shadow-mapSize={[2048,2048]}/>
        <directionalLight position={[-4,6,-4]} intensity={0.8} color="#ffe0c0"/>

        <JazzClub myPosRef={myPosRef} onSit={handleSit} seatMap={seatMap} myChairId={myChairId}/>
        <StagePerformer/>
        <MyAvatar posRef={myPosRef}/>

        {Object.entries(players).map(([sid, d]) => (
          <RemoteAvatar
            key={sid}
            position={d.pos}
            color={d.color}
            seated={d.seated}
            speaking={!!speakingPlayers[sid]}
          />
        ))}

        {floatingEmojis.map(fe => (
          <FloatingEmoji3D key={fe.id} emoji={fe.emoji} x={fe.x} z={fe.z}/>
        ))}

        {/* ── Controller selection ── */}
        {vrConnected ? (
          // PC VR headset
          <>
            <VRPlayerController posRef={myPosRef} headPoseRef={headPose} leftHandRef={leftHand}/>
            <VRHands leftHandRef={leftHand} rightHandRef={rightHand}/>
          </>
        ) : cardboardConnected ? (
          // ★ NEW: Google Cardboard gyro-driven camera (mobile only)
          <CardboardCameraController
            posRef={myPosRef}
            headPose={headPose}
            roomId={roomId}
            avatarType={avatarType}
          />
        ) : (
          // Standard PC WASD controller
          <PlayerController
            posRef={myPosRef}
            roomId={roomId}
            avatarType={avatarType}
            onLocked={setLocked}
            onSitFromKey={handleSitFromKey}
            onToggleMic={toggleMic}
            onToggleMusic={() => { if (musicControlRef.current) musicControlRef.current.togglePlay(); }}
          />
        )}
      </Canvas>

      {/* ════ CARDBOARD POPUP ════ */}
      {showCardboardPopup && (
        <CardboardConnectedPopup onDismiss={() => setShowCardboardPopup(false)}/>
      )}

      {/* ════ MOBILE JOYSTICK (Cardboard mode only) ════ */}
      {cardboardConnected && (
        <MobileJoystick posRef={myPosRef}/>
      )}

      {/* ════ HUD — TOP BAR ════ */}
      <div style={{
        position:"fixed", top:0, left:0, right:0, zIndex:200,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 20px", height:56,
        background:"linear-gradient(180deg,rgba(5,2,0,0.95) 0%,rgba(5,2,0,0) 100%)",
        fontFamily:"'DM Sans',system-ui,sans-serif",
        pointerEvents:"none",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, pointerEvents:"all" }}>
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            background:"rgba(5,2,0,0.85)", backdropFilter:"blur(16px)",
            border:"1px solid rgba(200,148,26,0.25)", borderRadius:12,
            padding:"7px 16px",
          }}>
            <div style={{
              width:8, height:8, borderRadius:"50%",
              background:"#c8941a", boxShadow:"0 0 8px #c8941a",
              animation:"glowPulse 2s ease-in-out infinite",
            }}/>
            <span style={{ fontSize:13, fontWeight:600, color:"#f5c880", letterSpacing:"0.04em" }}>
              🎷 Jazz Club
            </span>
            <div style={{ width:1, height:14, background:"rgba(200,148,26,0.2)", margin:"0 4px" }}/>
            <span style={{ fontSize:11, color:"#6b4a1a", fontWeight:500 }}>
              {playerCount} {playerCount===1?"player":"players"}
            </span>
          </div>
          {myChairId && (
            <div style={{
              background:"rgba(100,223,223,0.12)", backdropFilter:"blur(12px)",
              border:"1px solid rgba(100,223,223,0.3)", borderRadius:10,
              padding:"5px 12px", fontSize:11, color:"#64dfdf", fontWeight:600,
              display:"flex", alignItems:"center", gap:5,
              animation:"fadeIn 0.3s ease",
            }}>
              💺 Seated
            </div>
          )}
          {/* ★ NEW: Cardboard indicator */}
          {cardboardConnected && (
            <div style={{
              background:"rgba(34,197,94,0.12)", backdropFilter:"blur(12px)",
              border:"1px solid rgba(34,197,94,0.3)", borderRadius:10,
              padding:"5px 12px", fontSize:11, color:"#22c55e", fontWeight:600,
              display:"flex", alignItems:"center", gap:5,
            }}>
              📦 Cardboard
            </div>
          )}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8, pointerEvents:"all" }}>
          {/* ★ NEW: Exit Cardboard button (top bar, mobile) */}
          {cardboardConnected && (
            <div
              onClick={handleExitCardboard}
              style={{
                background:"rgba(5,2,0,0.85)", backdropFilter:"blur(16px)",
                border:"1px solid rgba(34,197,94,0.4)", borderRadius:10,
                padding:"7px 14px", color:"#22c55e", fontSize:12, fontWeight:600,
                cursor:"pointer", display:"flex", alignItems:"center", gap:6,
                letterSpacing:"0.05em",
              }}
            >
              ✕ Exit Cardboard
            </div>
          )}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (document.pointerLockElement) document.exitPointerLock();
              navigate("/rooms");
            }}
            style={{
              background:"rgba(5,2,0,0.85)", backdropFilter:"blur(16px)",
              border:"1px solid rgba(200,148,26,0.2)", borderRadius:10,
              padding:"7px 16px", color:"#c8941a", fontSize:12, fontWeight:600,
              cursor:"pointer",
              display:"flex", alignItems:"center", gap:6,
              transition:"all 0.2s",
              letterSpacing:"0.05em",
              zIndex:999, position:"relative",
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(200,148,26,0.5)";e.currentTarget.style.background="rgba(200,148,26,0.12)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(200,148,26,0.2)";e.currentTarget.style.background="rgba(5,2,0,0.85)";}}
          >
            <span style={{fontSize:14}}>←</span> Leave Room
          </div>
        </div>
      </div>

      {/* ── FPP CROSSHAIR ── */}
      {locked && !cardboardConnected && (
        <div style={{
          position:"fixed", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          pointerEvents:"none", zIndex:300, width:20, height:20,
        }}>
          <div style={{position:"absolute",top:"50%",left:0,right:0,height:1,marginTop:"-0.5px",background:"rgba(255,255,255,0.65)"}}/>
          <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,marginLeft:"-0.5px",background:"rgba(255,255,255,0.65)"}}/>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:3,height:3,borderRadius:"50%",background:"rgba(255,255,255,0.9)"}}/>
        </div>
      )}

      {/* ── ENTRY OVERLAY (before pointer lock, desktop only) ── */}
      {!locked && !cardboardConnected && (
        <div style={{
          position:"fixed", inset:0, zIndex:250,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          background:"rgba(5,2,0,0.7)", backdropFilter:"blur(4px)",
          fontFamily:"'DM Sans',system-ui",
          pointerEvents:"none",
        }}>
          <div style={{
            border:"1px solid rgba(200,148,26,0.35)", borderRadius:20,
            padding:"32px 52px", textAlign:"center",
            background:"rgba(8,4,1,0.9)", backdropFilter:"blur(20px)",
            boxShadow:"0 0 0 1px rgba(200,148,26,0.08), 0 40px 80px rgba(0,0,0,0.6)",
            animation:"floatUp 0.5s ease",
            pointerEvents:"all",
          }}>
            <div style={{fontSize:48, marginBottom:16}}>🎷</div>
            <div style={{
              fontFamily:"'Playfair Display',Georgia,serif",
              fontSize:28, fontWeight:700, color:"#f5c880", marginBottom:8,
            }}>
              {isMobile ? "Welcome to Jazz Club" : "Click to Enter"}
            </div>
            <p style={{fontSize:13, color:"#6b4a1a", marginBottom:24, lineHeight:1.6}}>
              {isMobile
                ? "Use Cardboard VR mode to explore in 360°\nor tap and drag to look around"
                : "Lock your mouse to look around\nand explore the Jazz Club in first-person"
              }
            </p>

            {/* Desktop: Enter Room button */}
            {!isMobile && (
              <div
                onClick={requestLock}
                style={{
                  display:"inline-flex", alignItems:"center", gap:10,
                  background:"linear-gradient(135deg,#c8941a,#f5c880)",
                  borderRadius:50, padding:"13px 36px",
                  color:"#080401", fontWeight:700, fontSize:14, letterSpacing:"0.06em",
                  cursor:"pointer", marginBottom:16,
                  boxShadow:"0 6px 24px rgba(200,148,26,0.4)",
                  transition:"transform 0.15s",
                }}
                onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
                onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
              >
                🖱️ &nbsp;Enter Room
              </div>
            )}

            {/* Desktop: Enter VR */}
            {!isMobile && vrSupported && (
              <div
                onClick={enterVR}
                style={{
                  display:"inline-flex", alignItems:"center", gap:10,
                  background:"linear-gradient(135deg,#1a3a6b,#3a7bd5)",
                  borderRadius:50, padding:"13px 36px",
                  color:"#e8f4fd", fontWeight:700, fontSize:14, letterSpacing:"0.06em",
                  cursor:"pointer", marginBottom:16, marginLeft:12,
                  boxShadow:"0 6px 24px rgba(58,123,213,0.45)",
                  transition:"transform 0.15s",
                  border:"1px solid rgba(99,179,237,0.35)",
                }}
                onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
                onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
              >
                🥽 &nbsp;Enter VR
              </div>
            )}

            {/* ★ NEW: Mobile — Cardboard VR button */}
            {/* Mobile: use WebXR polyfill Cardboard mode */}
{isMobile && (
  <div style={{display:"flex", flexDirection:"column", gap:12, alignItems:"center"}}>
    <div
      onClick={enterVR}
      style={{
        display:"inline-flex", alignItems:"center", gap:10,
        background:"linear-gradient(135deg,#1a4a1a,#22c55e)",
        borderRadius:50, padding:"13px 36px",
        color:"#f0fff0", fontWeight:700, fontSize:14, letterSpacing:"0.06em",
        cursor:"pointer",
        boxShadow:"0 6px 24px rgba(34,197,94,0.4)",
        transition:"transform 0.15s",
        border:"1px solid rgba(34,197,94,0.4)",
      }}
      onTouchStart={e=>e.currentTarget.style.transform="scale(0.97)"}
      onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
    >
      📦 &nbsp;Google Cardboard VR
    </div>
    <div style={{fontSize:11, color:"#4a3010"}}>
      Put your phone in a Cardboard viewer after tapping
    </div>
  </div>
)}

            {!isMobile && (
              <div style={{marginTop:4, fontSize:11, color:"#3a2010", letterSpacing:"0.05em"}}>
                Press ESC anytime to release mouse
              </div>
            )}
            <div
              onClick={() => navigate("/rooms")}
              style={{
                marginTop:20, fontSize:12, color:"#4a3010", cursor:"pointer",
                textDecoration:"underline", letterSpacing:"0.04em",
                transition:"color 0.2s",
              }}
              onMouseEnter={e=>e.currentTarget.style.color="#c8941a"}
              onMouseLeave={e=>e.currentTarget.style.color="#4a3010"}
            >
              ← Back to rooms
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM CONTROL BAR (desktop, when locked) ── */}
      {locked && !cardboardConnected && (
        <div style={{
          position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)",
          zIndex:150, fontFamily:"'DM Sans',system-ui",
          background:"rgba(5,2,0,0.8)", backdropFilter:"blur(16px)",
          border:"1px solid rgba(200,148,26,0.12)", borderRadius:14,
          padding:"8px 20px",
          display:"flex", alignItems:"center", gap:18,
        }}>
          {[
            {keys:["W","A","S","D"], label:"Move"},
            {keys:["E"],             label:"Sit / Stand"},
            {keys:["M"],             label:"Mic on/off"},
            {keys:["Space"],         label:"Music on/off"},
            {keys:["ESC"],           label:"Release mouse"},
          ].map(({keys,label},i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{display:"flex",gap:3}}>
                {keys.map(k=>(
                  <kbd key={k} style={{
                    display:"inline-flex",alignItems:"center",justifyContent:"center",
                    background:"rgba(200,148,26,0.12)",border:"1px solid rgba(200,148,26,0.25)",
                    borderRadius:5, padding:"2px 7px", fontSize:10, color:"#c8941a",
                    fontFamily:"system-ui", minWidth:20, fontWeight:700,
                  }}>{k}</kbd>
                ))}
              </div>
              <span style={{fontSize:11,color:"#4a3010"}}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── EMOJI REACTION BAR ── */}
      <EmojiBar onEmoji={sendEmoji} locked={locked}/>

      {/* ── MIC BUTTON ── */}
      <MicButton active={micActive} onToggle={toggleMic}/>

      {/* ── SPEAKING TOAST ── */}
      {Object.entries(speakingPlayers).filter(([,v])=>v).map(([sid])=>{
        const pl = players[sid]; if(!pl) return null;
        return (
          <div key={sid} style={{
            position:"fixed", top:70, right:20, zIndex:180,
            background:"rgba(5,2,0,0.88)", backdropFilter:"blur(14px)",
            border:"1px solid rgba(110,231,183,0.35)", borderRadius:12,
            padding:"8px 16px", color:"#6ee7b7", fontSize:12, fontWeight:700,
            display:"flex", alignItems:"center", gap:8,
            animation:"slideInRight 0.3s ease",
          }}>
            <div style={{
              width:8,height:8,borderRadius:"50%",background:"#6ee7b7",
              boxShadow:"0 0 8px #6ee7b7", animation:"glowPulse 0.8s ease-in-out infinite",
            }}/>
            Player speaking…
          </div>
        );
      })}

      {/* ── MUSIC PLAYER ── */}
      <MusicPlayer controlRef={musicControlRef}/>

      {/* ── VR CONNECTED POPUP ── */}
      <VRConnectedPopup visible={vrPopupVisible} onClose={() => setVrPopupVisible(false)}/>

      {/* ── EXIT VR BUTTON ── */}
      {vrConnected && (
        <div
          onClick={exitVR}
          style={{
            position:"fixed", bottom:20, right:20, zIndex:500,
            display:"flex", alignItems:"center", gap:8,
            background:"rgba(13,17,38,0.92)", backdropFilter:"blur(14px)",
            border:"1px solid rgba(99,179,237,0.4)", borderRadius:12,
            padding:"10px 18px", color:"#63b3ed", fontSize:13, fontWeight:700,
            cursor:"pointer", letterSpacing:"0.04em",
            boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
            transition:"all 0.2s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(99,179,237,0.15)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(13,17,38,0.92)";}}
        >
          🥽 Exit VR
        </div>
      )}

      <style>{`
        @keyframes spin          { to { transform: rotate(360deg); } }
        @keyframes glowPulse     { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes micPulse      { 0%,100%{box-shadow:0 0 20px rgba(239,68,68,0.4)} 50%{box-shadow:0 0 40px rgba(239,68,68,0.8),0 0 70px rgba(239,68,68,0.3)} }
        @keyframes slideUp       { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInRight  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes emojiPop      { from{transform:scale(0) rotate(-15deg)} to{transform:scale(1) rotate(0deg)} }
        @keyframes fadeIn        { from{opacity:0} to{opacity:1} }
        @keyframes floatUp       { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        body:not(.pointer-locked) { cursor: auto !important; }
      `}</style>
    </div>
  );
}