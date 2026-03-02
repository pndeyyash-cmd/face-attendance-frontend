import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

export default function Scanner() {
  const webcamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState("Biometric System Standby. Awaiting Authorization.");

  const isScanningRef = useRef(isScanning);
  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);

  const processFrame = useCallback(async () => {
    if (!isScanningRef.current) return;

    const imageSrc = webcamRef.current?.getScreenshot();

    if (!imageSrc) {
      setStatus("❌ Hardware Error: Visual feed interrupted.");
      setIsScanning(false);
      return;
    }

    try {
      setStatus("Analyzing Biometric Data...");
      
      const response = await axios.post('https://face-attendance-backend-3o2a.onrender.com/recognize', {
        image: imageSrc
      });

      if (response.status === 200 || response.status === 201) {
        setStatus(`✅ Access Granted: ${response.data.message}`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setStatus("❌ Access Restricted: Identity Not Found.");
        } else if (error.response.status === 400) {
          setStatus(`⚠️ Protocol Warning: ${error.response.data.error}`);
        } else {
          setStatus(`❌ System Fault: ${error.response.status}`);
        }
      } else {
        setStatus("❌ FATAL: Network Uplink Severed.");
        setIsScanning(false);
        return;
      }
    }

    if (isScanningRef.current) {
      setTimeout(processFrame, 1000);
    }
  }, []);

  useEffect(() => {
    if (isScanning) {
      processFrame();
    }
  }, [isScanning, processFrame]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '100vh', 
      width: '100%',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', 
      color: 'white',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <h2 style={{ 
        fontSize: '2.5rem', 
        fontWeight: '800',
        marginBottom: '10px',
        background: 'linear-gradient(to right, #00dbde, #fc00ff)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent'
      }}>
        Biometric Recognition Terminal
      </h2>
      <p style={{ color: '#888', marginBottom: '30px' }}>Secure Multi-Factor Identity Verification</p>
      
      {/* --- Scanner HUD Container --- */}
      <div style={{ 
        position: 'relative',
        border: '2px solid rgba(0, 212, 255, 0.5)', 
        borderRadius: '20px', 
        overflow: 'hidden', 
        width: '100%', 
        maxWidth: '720px',
        aspectRatio: '4/3', 
        backgroundColor: '#000',
        boxShadow: '0 0 40px rgba(0, 212, 255, 0.2)',
        marginBottom: '30px'
      }}>
        <Webcam 
          audio={false} 
          ref={webcamRef} 
          screenshotFormat="image/jpeg" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          videoConstraints={{ facingMode: "user" }}
          onUserMediaError={(error) => {
            setStatus(`❌ Sensor Offline: ${error.message || error.name}`);
            setIsScanning(false);
          }}
        />

        {/* --- High-Tech Overlay Elements --- */}
        {isScanning && (
          <>
            {/* Pulsing Scanning Reticle */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '250px', height: '250px',
              border: '2px dashed #00d4ff',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            
            {/* Corner HUD Brackets */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', width: '40px', height: '40px', borderLeft: '3px solid #00d4ff', borderTop: '3px solid #00d4ff' }}></div>
            <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderRight: '3px solid #00d4ff', borderTop: '3px solid #00d4ff' }}></div>
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '40px', height: '40px', borderLeft: '3px solid #00d4ff', borderBottom: '3px solid #00d4ff' }}></div>
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '40px', height: '40px', borderRight: '3px solid #00d4ff', borderBottom: '3px solid #00d4ff' }}></div>

            {/* Scrolling Scan Line */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '2px',
              background: 'rgba(0, 212, 255, 0.5)',
              boxShadow: '0 0 15px #00d4ff',
              animation: 'scan-move 4s linear infinite'
            }}></div>
          </>
        )}
      </div>

      <button 
        onClick={() => setIsScanning(!isScanning)} 
        style={{ 
          padding: '18px 50px', 
          fontSize: '18px', 
          background: isScanning ? 'transparent' : 'linear-gradient(45deg, #007bff, #00d4ff)', 
          color: 'white', 
          border: isScanning ? '1px solid #ff7675' : 'none', 
          borderRadius: '12px', 
          cursor: 'pointer', 
          fontWeight: 'bold',
          transition: 'all 0.3s',
          boxShadow: isScanning ? 'none' : '0 4px 15px rgba(0, 123, 255, 0.3)'
        }}
      >
        {isScanning ? "TERMINATE SCAN" : "INITIALIZE SCANNER"}
      </button>

      {/* --- Status Bar --- */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px 40px',
        borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${status.includes("✅") ? '#2ecc71' : status.includes("❌") ? '#ff7675' : 'rgba(255,255,255,0.1)'}`,
        color: status.includes("✅") ? '#2ecc71' : status.includes("❌") ? '#ff7675' : '#fff',
        fontWeight: '600',
        letterSpacing: '1px'
      }}>
        {status.toUpperCase()}
      </div>

      <style>{`
        @keyframes scan-move {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}