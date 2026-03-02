import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageStudents() {
  const [records, setRecords] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // Using existing endpoint, keeping backend logic intact
      const response = await axios.get('https://face-attendance-backend-3o2a.onrender.com/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRecords(response.data);
      setMessage(""); 
    } catch (err) {
      console.error(err);
      setMessage("⚠️ System Syncing: The cloud database is initializing. Please wait 30 seconds and refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleDelete = async (uniqueID) => {
    if (!window.confirm(`Permanently remove entry ${uniqueID} from the secure database?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`https://face-attendance-backend-3o2a.onrender.com/students/${uniqueID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessage(`✅ Record ${uniqueID} successfully purged.`);
      fetchRecords();
    } catch (err) {
      setMessage("❌ Access Denied: Verification failed.");
    }
  };

  const filteredRecords = records.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', 
      color: 'white',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: '2.5rem', 
          marginBottom: '10px', 
          background: 'linear-gradient(to right, #00dbde, #fc00ff)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          fontWeight: '800'
        }}>
          Identity Control Center
        </h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '30px' }}>Secure Management for Global Personnel & Assets</p>

        {/* --- Unified Search & Stats --- */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '30px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '20px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <input 
            type="text" 
            placeholder="Search by Name or Identification ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '12px 20px', 
              borderRadius: '8px', 
              border: 'none', 
              backgroundColor: 'rgba(0,0,0,0.3)', 
              color: 'white',
              outline: 'none'
            }}
          />
          <div style={{ 
            background: 'linear-gradient(45deg, #007bff, #6610f2)', 
            padding: '12px 25px', 
            borderRadius: '8px', 
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)'
          }}>
            Total Active: {filteredRecords.length}
          </div>
        </div>

        {message && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px', 
            padding: '15px', 
            borderRadius: '8px', 
            background: message.includes('✅') ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
            border: `1px solid ${message.includes('✅') ? '#2ecc71' : '#e74c3c'}`,
            color: message.includes('✅') ? '#2ecc71' : '#ff7675'
          }}>
            {message}
          </div>
        )}

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          borderRadius: '20px', 
          overflow: 'hidden',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}>
          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center' }}>
              <h3 style={{ color: '#00d4ff', letterSpacing: '2px' }}>SYNCHRONIZING ENCRYPTED DATA...</h3>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left' }}>
                  <th style={{ padding: '20px' }}>Authorized User</th>
                  <th style={{ padding: '20px' }}>Unique Identifier</th>
                  <th style={{ padding: '20px', textAlign: 'right' }}>Security Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.roll_number} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: '0.3s' }}>
                    <td style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img 
                        src={r.profile_pic || "https://via.placeholder.com/50"} 
                        alt="User" 
                        onClick={() => setSelectedImage(r.profile_pic || "https://via.placeholder.com/50")}
                        style={{ 
                          width: '45px', 
                          height: '45px', 
                          borderRadius: '10px', 
                          objectFit: 'cover', 
                          border: '2px solid #00d4ff',
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }} 
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>{r.name}</span>
                    </td>
                    <td style={{ padding: '20px', color: '#00d4ff', fontFamily: 'monospace', fontSize: '1.1rem' }}>{r.roll_number}</td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(r.roll_number)} 
                        style={{ 
                          backgroundColor: 'transparent', 
                          color: '#ff7675', 
                          border: '1px solid #ff7675', 
                          padding: '6px 15px', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#ff7675';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#ff7675';
                        }}
                      >
                        Revoke Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- Image Modal (Strict Button-Only Close) --- */}
      {selectedImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(10px)'
        }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-50px',
                right: '-10px',
                background: '#ff7675',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '24px',
                fontWeight: 'bold',
                boxShadow: '0 0 15px rgba(255, 118, 117, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              ×
            </button>

            <img 
              src={selectedImage} 
              alt="Identity Verification" 
              onClick={(e) => e.stopPropagation()} 
              style={{ 
                maxWidth: '85%', 
                maxHeight: '80vh', 
                borderRadius: '15px', 
                border: '2px solid #00d4ff',
                boxShadow: '0 0 30px rgba(0, 212, 255, 0.2)'
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}