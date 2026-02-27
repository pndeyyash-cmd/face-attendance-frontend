import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // State for the Image Pop-out
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('https://face-attendance-backend-3o2a.onrender.com/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (err) {
      setMessage("❌ Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleDelete = async (rollNumber) => {
    if (!window.confirm(`Delete student ${rollNumber}? This also wipes their attendance logs.`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`https://face-attendance-backend-3o2a.onrender.com/students/${rollNumber}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessage(`✅ Student ${rollNumber} deleted.`);
      fetchStudents();
    } catch (err) {
      setMessage("❌ Deletion failed.");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingBottom: '50px' }}>
      <h2 style={{ borderBottom: '2px solid #e74c3c', paddingBottom: '10px', marginBottom: '20px' }}>Student Management</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', maxWidth: '800px', marginBottom: '20px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Search by name or roll number..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '12px', width: '70%', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }}
        />
        <div style={{ backgroundColor: '#007BFF', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold' }}>
          Total: {filteredStudents.length}
        </div>
      </div>

      {message && <p style={{ backgroundColor: '#222', padding: '10px', borderRadius: '5px', color: '#f39c12' }}>{message}</p>}

      {loading ? <h3>Loading Database...</h3> : (
        <div style={{ width: '90%', maxWidth: '800px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#222', borderRadius: '8px', overflow: 'hidden' }}>
            <thead style={{ backgroundColor: '#444' }}>
              <tr>
                <th style={{ padding: '15px' }}>Photo</th>
                <th style={{ padding: '15px' }}>Name</th>
                <th style={{ padding: '15px' }}>Roll Number</th>
                <th style={{ padding: '15px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.roll_number} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <img 
                      src={s.profile_pic || "https://via.placeholder.com/45"} 
                      alt="Profile" 
                      onClick={() => setSelectedImage(s.profile_pic || "https://via.placeholder.com/45")}
                      style={{ 
                        width: '45px', 
                        height: '45px', 
                        borderRadius: '50%', 
                        objectFit: 'cover', 
                        border: '2px solid #007BFF',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }} 
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>{s.name}</td>
                  <td style={{ padding: '15px', textAlign: 'center', color: '#f39c12', fontWeight: 'bold' }}>{s.roll_number}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button onClick={() => handleDelete(s.roll_number)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && <h4 style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>No matches found.</h4>}
        </div>
      )}

      {/* --- Image Pop-out Modal --- */}
      {selectedImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ position: 'relative', maxWidth: '80%', maxHeight: '80%' }}>
            {/* Close Button */}
            <button 
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                fontSize: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
              }}
            >
              ×
            </button>
            <img 
              src={selectedImage} 
              alt="Enlarged Profile" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh', 
                borderRadius: '10px', 
                border: '4px solid white',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}