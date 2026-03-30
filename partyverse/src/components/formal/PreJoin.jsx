import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import "./PreJoin.css";

export default function PreJoin(){
  const { id } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [mic,setMic] = useState(true);
  const [cam,setCam] = useState(true);
  const [name,setName] = useState("");

  useEffect(()=>{
    async function start(){
      const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    }
    start();

    return ()=>streamRef.current?.getTracks().forEach(t=>t.stop());
  },[]);

  function toggleMic(){
    const track = streamRef.current.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setMic(track.enabled);
  }

  function toggleCam(){
    const track = streamRef.current.getVideoTracks()[0];
    track.enabled = !track.enabled;
    setCam(track.enabled);
  }

  function join(){
    if(!name) return alert("Enter name");
    navigate(`/formal/room/${id}`, { state:{ name } });
  }

  return (
    <div className="prejoin-root">

      <div className="video-preview">
        <video ref={videoRef} autoPlay muted playsInline/>
      </div>

      <div className="controls">
        <button onClick={toggleMic}>{mic ? <Mic/> : <MicOff/>}</button>
        <button onClick={toggleCam}>{cam ? <Video/> : <VideoOff/>}</button>
      </div>

      <input
        className="name-input"
        placeholder="Enter your name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <button className="join-btn" onClick={join}>
        Join Meeting
      </button>

    </div>
  );
}