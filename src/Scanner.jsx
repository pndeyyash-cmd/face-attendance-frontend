import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import * as faceapi from 'face-api.js';

export default function Scanner() {
  const webcamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [status, setStatus] = useState("VERIFYING SECURE ZONE...");

  // --- DYNAMIC GEOFENCING STATE ---
  const [currentLocation, setCurrentLocation] = useState(null);
  const [secureZone, setSecureZone] = useState(null);
  const [isWithinZone, setIsWithinZone] = useState(false);
  const ALLOWED_RADIUS_METERS = 100;

  const BLINK_THRESHOLD = 0.22;

  // 1. Haversine Math
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; 
    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); 
  };

  // 2. Track Real-time Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLocation({ lat, lng });

          // If a zone is set, constantly check if we are inside it
          if (secureZone) {
            const dist = calculateDistance(lat, lng, secureZone.lat, secureZone.lng);
            if (dist <= ALLOWED_RADIUS_METERS) {
              setIsWithinZone(true);
              if (!modelsLoaded) loadModels();
            } else {
              setIsWithinZone(false);
              setIsScanning(false); // Kill scanner if they walk away
              setStatus(`❌ SECURITY ALERT: Terminal moved ${Math.round(dist)}m outside secure zone.`);
            }
          } else {
             setStatus("⚠️ SYSTEM UNLOCKED: Please set a Secure Zone to begin.");
          }
        },
        (error) => setStatus("❌ FATAL: GPS Permission Denied."),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [secureZone, modelsLoaded]);

  // 3. Admin Function to Lock the Zone
  const lockCurrentLocation = () => {
    if (currentLocation) {
      setSecureZone(currentLocation);
      setIsWithinZone(true);
      setStatus("✅ SECURE ZONE LOCKED. Loading Biometrics...");
      loadModels();
    }
  };

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
    }
  };

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
      const response = await axios.post('https://face-attendance-backend-3o2a.onrender.com/recognize', { image: imageSrc });
      if (response.status === 200 || response.status === 201) {
        setStatus(`✅ Access Granted: ${response.data.message}`);
        setIsScanning(false); 
        setBlinkDetected(false);
      }
    } catch (error) {
      setIsScanning(false);
      setBlinkDetected(false);
      setStatus(error.response?.status === 404 ? "❌ Access Restricted: Identity Not Found." : "⚠️ Protocol Warning.");
    }
  };

  const detectLiveness = useCallback(async () => {
    if (!isScanning || !webcamRef.current || blinkDetected || !isWithinZone) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      setTimeout(detectLiveness, 150);
      return;
    }

    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold: 0.6 })).withFaceLandmarks();

    if (detections) {
      const avgEAR = (calculateEAR(detections.landmarks.getLeftEye()) + calculateEAR(detections.landmarks.getRightEye())) / 2;
      if (avgEAR < BLINK_THRESHOLD) {
        setBlinkDetected(true);
        setStatus("LIVENESS CONFIRMED. AUTHENTICATING...");
        processIdentity(webcamRef.current.getScreenshot());
        return; 
      } else {
        setStatus("AWAITING LIVENESS PROOF: PLEASE BLINK");
      }
    }
    if (isScanning && !blinkDetected) setTimeout(detectLiveness, 150);
  }, [isScanning, blinkDetected, isWithinZone]);

  useEffect(() => {
    if (isScanning && modelsLoaded && isWithinZone) detectLiveness();
  }, [isScanning, modelsLoaded, isWithinZone, detectLiveness]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', width: '100%', padding: '40px 20px', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: 'white', fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', background: 'linear-gradient(to right, #00dbde, #fc00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Biometric Recognition Terminal</h2>
      
      {/* GEOFENCE CONTROLS */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button 
          onClick={lockCurrentLocation} 
          disabled={!currentLocation}
          style={{ padding: '10px 20px', background: secureZone ? '#2ecc71' : '#ff9f43', color: '#000', border: 'none', borderRadius: '8px', cursor: currentLocation ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
          {secureZone ? "📍 SECURE ZONE ACTIVE" : "🔒 SET CURRENT LOCATION AS SECURE ZONE"}
        </button>
        {secureZone && (
          <button onClick={() => { setSecureZone(null); setIsWithinZone(false); setIsScanning(false); }} style={{ padding: '10px 20px', background: 'transparent', color: '#ff7675', border: '1px solid #ff7675', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            RELEASE ZONE
          </button>
        )}
      </div>

      <div style={{ position: 'relative', border: `2px solid ${isWithinZone ? 'rgba(0, 212, 255, 0.5)' : '#ff4757'}`, borderRadius: '20px', overflow: 'hidden', width: '100%', maxWidth: '720px', aspectRatio: '4/3', backgroundColor: '#000', boxShadow: `0 0 40px ${isWithinZone ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 71, 87, 0.2)'}`, marginBottom: '30px' }}>
        
        {/* Only show camera if location is locked AND verified */}
        {isWithinZone ? (
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} videoConstraints={{ width: 640, height: 480, facingMode: "user" }} />
        ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ff4757', padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '3rem', marginBottom: '10px' }}>🌍</span>
                <strong style={{ fontSize: '1.2rem' }}>
                  {secureZone ? "TERMINAL OUTSIDE AUTHORIZED ZONE" : "AWAITING GEOFENCE ACTIVATION"}
                </strong>
                <p style={{ color: '#888', marginTop: '10px', fontSize: '0.9rem' }}>The camera will remain locked until the terminal is secured.</p>
            </div>
        )}

        {isScanning && isWithinZone && (
          <div style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px 20px', background: 'rgba(0,0,0,0.7)', borderRadius: '8px', border: '1px solid #00d4ff', color: '#00d4ff', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>
            {blinkDetected ? "SUCCESS" : "ACTION: BLINK NOW"}
          </div>
        )}
      </div>

      <button 
        disabled={!modelsLoaded || !isWithinZone}
        onClick={() => { setIsScanning(!isScanning); setBlinkDetected(false); if(!isScanning) setStatus("AWAITING LIVENESS PROOF: PLEASE BLINK"); }} 
        style={{ padding: '18px 50px', fontSize: '18px', background: (!modelsLoaded || !isWithinZone) ? '#555' : isScanning ? 'transparent' : 'linear-gradient(45deg, #007bff, #00d4ff)', color: 'white', border: isScanning ? '1px solid #ff7675' : 'none', borderRadius: '12px', cursor: (!modelsLoaded || !isWithinZone) ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}>
        {isScanning ? "TERMINATE SCAN" : "INITIALIZE SCANNER"}
      </button>

      <div style={{ marginTop: '30px', padding: '15px 40px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: `1px solid ${status.includes("✅") ? '#2ecc71' : status.includes("❌") ? '#ff7675' : '#00d4ff'}`, color: status.includes("✅") ? '#2ecc71' : status.includes("❌") ? '#ff7675' : '#fff', fontWeight: '700', letterSpacing: '1px' }}>
        {status.toUpperCase()}
      </div>

      <style>{`
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}