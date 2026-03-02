import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('https://face-attendance-backend-3o2a.onrender.com/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStudents(response.data);
      setMessage(""); 
    } catch (err) {
      console.error(err);
      setMessage("❌ Connection Error: Backend might be waking up. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleDelete = async (rollNumber) => {
    if (!window.confirm(`Delete student ${rollNumber}? This action is permanent.`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`https://face-attendance-backend-3o2a.onrender.com/students/${rollNumber}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessage(`✅ Student ${rollNumber} removed.`);
      fetchStudents();
    } catch (err) {
      setMessage("❌ Deletion failed. Check admin permissions.");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', // Deep Space Gradient
      color: 'white',
      padding: '40px 20px',
      fontFamily: "'Segoe UI', Roboto, sans-serif"
    }}>
      
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: '2.5rem', 
          marginBottom: '30px', 
          background: 'linear-gradient(to right, #00dbde, #fc00ff)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          fontWeight: '800'
        }}>
          Database Management
        </h2>

        {/* --- Search Bar & Stats --- */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '30px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <input 
            type="text" 
            placeholder="Search by name or roll number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '12px 20px', 
              borderRadius: '8px', 
              border: 'none', 
              backgroundColor: 'rgba(0,0,0,0.3)', 
              color: 'white',
              outline: 'none',
              fontSize: '1rem'
            }}
          />
          <div style={{ 
            background: 'linear-gradient(45deg, #007bff, #00d4ff)', 
            padding: '12px 25px', 
            borderRadius: '8px', 
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)'
          }}>
            Records: {filteredStudents.length}
          </div>
        </div>

        {message && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px', 
            padding: '15px', 
            borderRadius: '8px', 
            background: message.includes('✅') ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
            border: `1px solid ${message.includes('✅') ? '#2ecc71' : '#e74c3c'}`
          }}>
            {message}
          </div>
        )}

        {/* --- Table Container --- */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: '20px', 
          overflow: 'hidden',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}>
          {loading ? (
            <div style={{ padding: '50px', textAlign: 'center' }}>
              <div className="spinner"></div> {/* Add CSS for spinner if needed */}
              <h3 style={{ marginTop: '20px' }}>Syncing with Cloud...</h3>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '20px' }}>Student</th>
                  <th style={{ padding: '20px' }}>Roll Number</th>
                  <th style={{ padding: '20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.roll_number} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: '0.3s' }} className="table-row">
                    <td style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img 
                        src={s.profile_pic || "https://via.placeholder.com/50"} 
                        alt="Profile" 
                        onClick={() => setSelectedImage(s.profile_pic || "https://via.placeholder.com/50")}
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '12px', 
                          objectFit: 'cover', 
                          border: '2px solid #00d4ff',
                          cursor: 'pointer'
                        }} 
                      />
                      <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>{s.name}</span>
                    </td>
                    <td style={{ padding: '20px', color: '#00d4ff', fontWeight: 'bold' }}>{s.roll_number}</td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(s.roll_number)} 
                        style={{ 
                          backgroundColor: 'rgba(231, 76, 60, 0.8)', 
                          color: 'white', 
                          border: 'none', 
                          padding: '8px 20px', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          transition: '0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(231, 76, 60, 0.8)'}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredStudents.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
              No students found in current records.
            </div>
          )}
        </div>
      </div>

      {/* --- Image Modal (Unchanged logic, cleaner look) --- */}
      {selectedImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(5px)'
        }} onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Preview" style={{ 
            maxWidth: '90%', maxHeight: '80vh', borderRadius: '15px', border: '3px solid #00d4ff' 
          }} />
        </div>
      )}
    </div>
  );
}