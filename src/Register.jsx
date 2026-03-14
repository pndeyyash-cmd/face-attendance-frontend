import { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

export default function Register() {
  const webcamRef = useRef(null);
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleRollChange = (e) => {
    let value = e.target.value.toUpperCase(); 
    value = value.replace(/[^A-Z0-9-]/g, ""); 
    setRollNumber(value);
  };

  const takeSnapshot = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPreviewImage(imageSrc);
      setStatus("Biometric Scan Captured. Review details.");
    } else {
      setStatus("❌ Capture Error: Check Hardware Connection.");
    }
  };

  const captureAndRegister = async (e) => {
    e.preventDefault(); 
    
    // ANTI-SPAM: Prevent multiple clicks while syncing
    if (loading) return;
    
    if (!name || !rollNumber) {
      setStatus("❌ Required: Personnel Name & Identifier missing.");
      return;
    }

    const rollPattern = /^[A-Z]{2,5}-\d{3,6}$/;
    if (!rollPattern.test(rollNumber)) {
      setStatus("❌ Format Invalid: Use DEPT-ID (e.g., HR-101)");
      return;
    }

    if (!previewImage) {
      setStatus("❌ Error: No Scan detected.");
      return;
    }

    setLoading(true);
    setStatus("Synchronizing Identity with Secure Cloud...");

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('https://face-attendance-backend-3o2a.onrender.com/register', {
        name: name,
        roll_number: rollNumber,
        image: previewImage 
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setStatus(`✅ Identity Registry Success: ${response.data.message}`);
      setName("");
      setRollNumber("");
      setPreviewImage(null);
      
    } catch (error) {
      setStatus("❌ Error: " + (error.response?.data?.error || "Registry Failure."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', 
      color: 'white', padding: '40px 20px', fontFamily: "'Inter', sans-serif"
    }}>
      <h2 style={{ 
        fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px',
        background: 'linear-gradient(to right, #00dbde, #fc00ff)', 
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
      }}>
        Onboard New Identity
      </h2>
      <p style={{ color: '#888', marginBottom: '30px' }}>Register biometric data for secure access control.</p>
      
      <div style={{ 
        display: 'flex', flexDirection: 'column', gap: '20px', 
        width: '100%', maxWidth: '700px', background: 'rgba(255, 255, 255, 0.05)',
        padding: '30px', borderRadius: '20px', backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Full Personnel Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            style={{ flex: 1, padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' }}
          />
          <input 
            type="text" 
            placeholder="Unique Asset ID (HR-101)" 
            value={rollNumber}
            onChange={handleRollChange}
            disabled={loading}
            style={{ flex: 1, padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' }}
          />
        </div>

        {/* --- Scanning Bay --- */}
        <div style={{ 
          position: 'relative', border: '2px solid rgba(0, 212, 255, 0.3)', 
          borderRadius: '15px', overflow: 'hidden', width: '100%', 
          aspectRatio: '4/3', backgroundColor: '#000', boxShadow: 'inset 0 0 50px rgba(0, 212, 255, 0.1)'
        }}>
          {previewImage ? (
            <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              {/* ENFORCED VIDEO CONSTRAINTS TO FIX UPLOAD LATENCY */}
              <Webcam 
                audio={false} 
                ref={webcamRef} 
                screenshotFormat="image/jpeg" 
                videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
                background: '#00d4ff', boxShadow: '0 0 15px #00d4ff', animation: 'scan 3s linear infinite'
              }}></div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          {!previewImage ? (
            <button onClick={takeSnapshot} style={{ 
              padding: '15px 40px', background: 'transparent', color: '#00d4ff', border: '1px solid #00d4ff', 
              borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' 
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#00d4ff'; e.currentTarget.style.color = '#000'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#00d4ff'; }}
            >
              INITIALIZE SCAN
            </button>
          ) : (
            <>
              <button onClick={() => setPreviewImage(null)} disabled={loading} style={{ padding: '15px 30px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                RETAKE
              </button>
              <button onClick={captureAndRegister} disabled={loading} style={{ 
                padding: '15px 30px', background: loading ? '#555' : 'linear-gradient(45deg, #007bff, #00d4ff)', color: 'white', 
                border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' 
              }}>
                {loading ? "SYNCING..." : "CONFIRM REGISTRY"}
              </button>
            </>
          )}
        </div>
      </div>

      {status && (
        <div style={{ 
          marginTop: '25px', padding: '15px 30px', borderRadius: '8px', 
          background: 'rgba(255, 255, 255, 0.05)', 
          border: `1px solid ${status.includes("✅") ? '#2ecc71' : '#ff7675'}`,
          color: status.includes("✅") ? '#2ecc71' : '#ff7675',
          fontWeight: '500'
        }}>
          {status}
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}