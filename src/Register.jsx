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

  // --- Forced Formatting Logic ---
  const handleRollChange = (e) => {
    let value = e.target.value.toUpperCase(); 
    // Strips everything except A-Z, 0-9, and the dash
    value = value.replace(/[^A-Z0-9-]/g, ""); 
    setRollNumber(value);
  };

  const takeSnapshot = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPreviewImage(imageSrc);
      setStatus("Snapshot captured. Review before registering.");
    } else {
      setStatus("❌ Error: Could not capture image.");
    }
  };

  const captureAndRegister = async (e) => {
    e.preventDefault(); 
    
    if (!name || !rollNumber) {
      setStatus("❌ Error: Name and Roll Number are required.");
      return;
    }

    // Pattern: 2-5 Letters, Dash, 3-6 Numbers (e.g. BTECH-101)
    const rollPattern = /^[A-Z]{2,5}-\d{3,6}$/;
    if (!rollPattern.test(rollNumber)) {
      setStatus("❌ Invalid Format! Must be COURSE-ID (e.g., BCA-001)");
      return;
    }

    if (!previewImage) {
      setStatus("❌ Error: Please take a snapshot first.");
      return;
    }

    setLoading(true);
    setStatus("Uploading photo and registering student...");

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('https://face-attendance-backend-3o2a.onrender.com/register', {
        name: name,
        roll_number: rollNumber,
        image: previewImage // This is the Base64 image for Cloudinary
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setStatus(`✅ ${response.data.message}`);
      setName("");
      setRollNumber("");
      setPreviewImage(null);
      
    } catch (error) {
      setStatus("❌ Error: " + (error.response?.data?.error || "Server error."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', width: '100%' }}>
      <h2>Student Registration</h2>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '320px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Student Name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '12px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }}
        />
        <input 
          type="text" 
          placeholder="Roll Number (e.g., BTECH-101)" 
          value={rollNumber}
          onChange={handleRollChange}
          style={{ padding: '12px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }}
        />
        <small style={{ color: '#888', textAlign: 'center' }}>Auto-formatting to UPPERCASE</small>
      </form>

      <div style={{ border: '4px solid #333', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px', width: '640px', height: '480px', backgroundColor: '#000' }}>
        {previewImage ? (
          <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={640} height={480} />
        )}
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        {!previewImage ? (
          <button onClick={takeSnapshot} style={{ padding: '15px 30px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Take Snapshot
          </button>
        ) : (
          <>
            <button onClick={() => setPreviewImage(null)} style={{ padding: '15px 30px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              Retake
            </button>
            <button onClick={captureAndRegister} disabled={loading} style={{ padding: '15px 30px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? "Registering..." : "Confirm & Register"}
            </button>
          </>
        )}
      </div>

      <h3 style={{ marginTop: '20px', color: status.includes("✅") ? '#28a745' : '#ff4c4c', backgroundColor: '#222', padding: '10px', borderRadius: '5px' }}>
        {status}
      </h3>
    </div>
  );
}