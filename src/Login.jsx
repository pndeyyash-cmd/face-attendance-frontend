import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Authenticating...");

    try {
      const response = await axios.post('https://face-attendance-backend-3o2a.onrender.com/login', {
        username: username.trim(),
        password: password
      });

      if (response.status === 200) {
        localStorage.setItem('adminToken', response.data.token);
        setStatus("✅ Login Successful! Redirecting to Management...");
        
        // Notify App component to update navigation state
        onLoginSuccess();
        
        // Auto-redirect to Students page after 1 second
        setTimeout(() => {
          navigate('/manage-students');
        }, 1000);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setStatus("❌ Unauthorized: Incorrect password.");
        } else if (error.response.status === 404) {
          setStatus("❌ Not Found: Admin user does not exist.");
        } else {
          setStatus(`❌ Server Error: ${error.response.status}`);
        }
      } else {
        setStatus("❌ FATAL ERROR: Could not connect to Python backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', width: '100%' }}>
      <div style={{ border: '2px solid #333', padding: '40px', borderRadius: '10px', backgroundColor: '#111', width: '350px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
        <h2 style={{ marginBottom: '25px', textAlign: 'center', color: 'white' }}>Admin Portal Access</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input 
            type="text" 
            placeholder="Admin Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: 'none', backgroundColor: '#222', color: 'white' }}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: 'none', backgroundColor: '#222', color: 'white' }}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '12px', fontSize: '18px', fontWeight: 'bold', 
              backgroundColor: loading ? '#555' : '#007BFF', color: 'white', 
              border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' 
            }}
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>

        {status && (
          <h4 style={{ marginTop: '20px', textAlign: 'center', color: status.includes("❌") || status.includes("FATAL") ? '#ff4c4c' : status.includes("✅") ? '#28a745' : '#aaa' }}>
            {status}
          </h4>
        )}
      </div>
    </div>
  );
}