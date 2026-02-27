import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

export default function Scanner() {
  const webcamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState("System idle. Click 'Start Scanner' to begin.");

  // Ref to track scanning state inside the async loop (prevents stale closures)
  const isScanningRef = useRef(isScanning);
  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);

  const processFrame = useCallback(async () => {
    // Stop immediately if the user toggled scanning off
    if (!isScanningRef.current) return;

    const imageSrc = webcamRef.current?.getScreenshot();

    if (!imageSrc) {
      setStatus("Error: Could not capture image from camera.");
      setIsScanning(false);
      return;
    }

    try {
      setStatus("Processing face...");
      
      // WARNING: Hardcoded local URL. You MUST change this to an environment variable before deployment.
      const response = await axios.post('https://face-attendance-backend-3o2a.onrender.com/recognize', {
        image: imageSrc
      });

      // Handle Success or Duplicate
      if (response.status === 200 || response.status === 201) {
        setStatus(`✅ ${response.data.message}`);
        
        // FORCED PAUSE: Wait 3 seconds so the user can read the success message before scanning the next person.
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      if (error.response) {
        // Handle specific API business logic errors
        if (error.response.status === 404) {
          setStatus("❌ Unknown Face. Keep looking at the camera.");
        } else if (error.response.status === 400) {
          setStatus(`⚠️ ${error.response.data.error}`);
        } else {
          setStatus(`❌ Server Error: ${error.response.status}`);
        }
      } else {
        // Handle fatal network disconnection
        setStatus("FATAL ERROR: Could not connect to Python backend.");
        setIsScanning(false);
        return; // Break the loop completely
      }
    }

    // THROTTLE: Wait 1 second before capturing the next frame. 
    // This prevents DoS attacking your own backend.
    if (isScanningRef.current) {
      setTimeout(processFrame, 1000);
    }
  }, []);

  // Trigger the loop when the user starts the scanner
  useEffect(() => {
    if (isScanning) {
      processFrame();
    }
  }, [isScanning, processFrame]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <h2>Live Attendance Kiosk</h2>
      
    <div style={{ border: '4px solid #333', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
     <Webcam 
      audio={false} 
      ref={webcamRef} 
      screenshotFormat="image/jpeg" 
      width={640} 
      height={480} 
      videoConstraints={{ facingMode: "user" }}
      onUserMediaError={(error) => {
      console.error("Webcam Error:", error);
      setStatus(`❌ Camera Access Denied: ${error.message || error.name}. Check browser permissions!`);
      setIsScanning(false);
    }}
      />
   </div>

      <button 
        onClick={() => setIsScanning(!isScanning)} 
        style={{ 
          padding: '15px 30px', 
          fontSize: '18px', 
          backgroundColor: isScanning ? '#dc3545' : '#28a745', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer', 
          fontWeight: 'bold',
          minWidth: '200px'
        }}
      >
        {isScanning ? "Stop Scanner" : "Start Scanner"}
      </button>

      <h3 style={{ 
        marginTop: '20px', 
        padding: '10px',
        borderRadius: '5px',
        backgroundColor: '#222',
        color: status.includes("✅") ? '#28a745' : status.includes("❌") || status.includes("FATAL") ? '#dc3545' : status.includes("⚠️") ? '#ffc107' : '#fff' 
      }}>
        {status}
      </h3>
    </div>
  );
}