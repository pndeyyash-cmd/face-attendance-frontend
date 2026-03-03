import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import * as faceapi from 'face-api.js';

export default function Scanner() {
  const webcamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [status, setStatus] = useState("INITIALIZING SECURITY PROTOCOLS...");

  const BLINK_THRESHOLD = 0.22;

  // Load AI Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models'; 
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatus("Biometric System Standby. Awaiting Authorization.");
      } catch (err) {
        setStatus("❌ FATAL: AI Models failed to load. Check /public/models.");
        console.error(err);
      }
    };
    loadModels();
  }, []);

  const calculateEAR = (eye) => {
    const dist = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    const vertical1 = dist(eye[1], eye[5]);
    const vertical2 = dist(eye[2], eye[4]);
    const horizontal = dist(eye[0], eye[3]);
    return (vertical1 + vertical2) / (2.0 * horizontal);
  };

  const processIdentity = async (imageSrc) => {
    try {
      setStatus("ANALYZING BIOMETRIC DATA...");
      const response = await axios.post('https://face-attendance-backend-3o2a.onrender.com/recognize', {
        image: imageSrc
      });

      if (response.status === 200 || response.status === 201) {
        setStatus(`✅ Access Granted: ${response.data.message}`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setBlinkDetected(false); 
        setStatus("Biometric System Standby. Awaiting Authorization.");
      }
    } catch (error) {
      setBlinkDetected(false);
      if (error.response?.status === 404) {
        setStatus("❌ Access Restricted: Identity Not Found.");
      } else {
        setStatus("⚠️ Protocol Warning: System Busy or Network Error.");
      }
    }
  };

  const detectLiveness = useCallback(async () => {
    if (!isScanning || !webcamRef.current || blinkDetected) return;

    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;

    // PERFORMANCE FIX: inputSize set to 160 dramatically reduces lag
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 }))
      .withFaceLandmarks();

    if (detections) {
      const landmarks = detections.landmarks;
      const avgEAR = (calculateEAR(landmarks.getLeftEye()) + calculateEAR(landmarks.getRightEye())) / 2;

      if (avgEAR < BLINK_THRESHOLD) {
        setBlinkDetected(true);
        setStatus("LIVENESS CONFIRMED. AUTHENTICATING...");
        processIdentity(webcamRef.current.getScreenshot());
      } else {
        setStatus("AWAITING LIVENESS PROOF: PLEASE BLINK");
      }
    }

    // PERFORMANCE FIX: Use setTimeout (100ms) instead of requestAnimationFrame 
    // to prevent the CPU from hitting 100% usage.
    if (isScanning && !blinkDetected) {
      setTimeout(() => {
        detectLiveness();
      }, 100);
    }
  }, [isScanning, blinkDetected]);

  useEffect(() => {
    if (isScanning && modelsLoaded) {
      detectLiveness();
    }
  }, [isScanning, modelsLoaded, detectLiveness]);

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      minHeight: '100vh', width: '100%', padding: '40px 20px',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', 
      color: 'white', fontFamily: "'Inter', sans-serif"
    }}>
      <h2 style={{ 
        fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px',
        background: 'linear-gradient(to right, #00dbde, #fc00ff)', 
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
      }}>
        Biometric Recognition Terminal
      </h2>
      <p style={{ color: '#888', marginBottom: '30px' }}>Secure Multi-Factor Identity Verification</p>
      
      <div style={{ 
        position: 'relative', border: '2px solid rgba(0, 212, 255, 0.5)', 
        borderRadius: '20px', overflow: 'hidden', width: '100%', 
        maxWidth: '720px', aspectRatio: '4/3', backgroundColor: '#000',
        boxShadow: '0 0 40px rgba(0, 212, 255, 0.2)', marginBottom: '30px'
      }}>
        <Webcam 
          audio={false} ref={webcamRef} screenshotFormat="image/jpeg" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
        />

        {isScanning && (
          <>
            {/* Visual Instruction Overlay */}
            <div style={{
              position: 'absolute', top: '20px', left: '20px', padding: '10px 20px',
              background: 'rgba(0,0,0,0.7)', borderRadius: '8px', border: '1px solid #00d4ff',
              color: '#00d4ff', fontWeight: 'bold', animation: 'pulse 1.5s infinite'
            }}>
              {blinkDetected ? "SCAN SUCCESSFUL" : "ACTION: BLINK NOW"}
            </div>

            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '250px', height: '250px', border: `2px ${blinkDetected ? 'solid' : 'dashed'} #00d4ff`,
              borderRadius: '50%', animation: blinkDetected ? 'none' : 'pulse 2s infinite'
            }}></div>
            
            <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderRight: '3px solid #00d4ff', borderTop: '3px solid #00d4ff' }}></div>
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '40px', height: '40px', borderLeft: '3px solid #00d4ff', borderBottom: '3px solid #00d4ff' }}></div>

            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
              background: '#00d4ff', boxShadow: '0 0 15px #00d4ff', animation: 'scan-move 4s linear infinite'
            }}></div>
          </>
        )}
      </div>

      <button 
        disabled={!modelsLoaded}
        onClick={() => {
            setIsScanning(!isScanning);
            setBlinkDetected(false);
            if(!isScanning) setStatus("AWAITING LIVENESS PROOF: PLEASE BLINK");
        }} 
        style={{ 
          padding: '18px 50px', fontSize: '18px', 
          background: isScanning ? 'transparent' : 'linear-gradient(45deg, #007bff, #00d4ff)', 
          color: 'white', border: isScanning ? '1px solid #ff7675' : 'none', 
          borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s'
        }}
      >
        {isScanning ? "TERMINATE SCAN" : "INITIALIZE SCANNER"}
      </button>

      <div style={{ 
        marginTop: '30px', padding: '15px 40px', borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)',
        border: `1px solid ${status.includes("✅") ? '#2ecc71' : status.includes("BLINK") ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`,
        color: status.includes("✅") ? '#2ecc71' : status.includes("BLINK") ? '#00d4ff' : '#fff',
        fontWeight: '700', letterSpacing: '1px'
      }}>
        {status.toUpperCase()}
      </div>

      <style>{`
        @keyframes scan-move { 0% { top: 0%; } 100% { top: 100%; } }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}