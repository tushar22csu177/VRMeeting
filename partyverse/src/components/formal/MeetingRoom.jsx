import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./MeetingRoom.css";

export default function MeetingRoom(){
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const name = location.state?.name || "Guest";

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [mic,setMic] = useState(true);
  const [cam,setCam] = useState(true);

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

  function leave(){
    navigate("/formal/dashboard");
  }

  return (
    <div className="room-root">

      <div className="room-header">
        Meeting: {id} | {name}
      </div>

      <div className="video-area">
        <div className="video-card">
          <video ref={videoRef} autoPlay muted playsInline/>
        </div>
      </div>

      <div className="controls-bar">
        <button onClick={toggleMic}>{mic ? <Mic/> : <MicOff/>}</button>
        <button onClick={toggleCam}>{cam ? <Video/> : <VideoOff/>}</button>
        <button className="leave-btn" onClick={leave}><PhoneOff/></button>
      </div>

    </div>
  );
}