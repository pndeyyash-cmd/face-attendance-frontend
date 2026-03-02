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
    setStatus("Initiating Secure Authentication...");

    try {
      const response = await axios.post('https://face-attendance-backend-3o2a.onrender.com/login', {
        username: username.trim(),
        password: password
      });

      if (response.status === 200) {
        localStorage.setItem('adminToken', response.data.token);
        setStatus("✅ Verification Successful! Access Granted.");
        
        onLoginSuccess();
        
        setTimeout(() => {
          navigate('/manage-students');
        }, 1200);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setStatus("❌ Access Denied: Invalid Security Token.");
        } else if (error.response.status === 404) {
          setStatus("❌ Entry Not Found: Identity Not Registered.");
        } else {
          setStatus(`❌ Encryption Error: Status ${error.response.status}`);
        }
      } else {
        setStatus("❌ FATAL: Network Uplink Severed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh', 
      width: '100%',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', // Deep Space Gradient
      color: 'white',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        padding: '50px 40px', 
        borderRadius: '20px', 
        width: '400px', 
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
        textAlign: 'center'
      }}>
        
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(to right, #00dbde, #fc00ff)',
          borderRadius: '50%',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 0 20px rgba(0, 219, 222, 0.4)'
        }}>
          🔒
        </div>

        <h2 style={{ 
          marginBottom: '10px', 
          fontSize: '1.8rem',
          fontWeight: '800',
          background: 'linear-gradient(to right, #00dbde, #fc00ff)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
        }}>
          Terminal Authentication
        </h2>
        <p style={{ color: '#888', marginBottom: '30px', fontSize: '0.9rem' }}>Enter credentials for Identity Control Center access.</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input 
            type="text" 
            placeholder="Registry Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={{ 
              padding: '14px', 
              fontSize: '16px', 
              borderRadius: '8px', 
              border: 'none', 
              backgroundColor: 'rgba(0,0,0,0.3)', 
              color: 'white',
              outline: 'none',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            required
          />
          <input 
            type="password" 
            placeholder="Access Token (Password)" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ 
              padding: '14px', 
              fontSize: '16px', 
              borderRadius: '8px', 
              border: 'none', 
              backgroundColor: 'rgba(0,0,0,0.3)', 
              color: 'white',
              outline: 'none',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '14px', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              backgroundColor: loading ? '#333' : 'transparent', 
              color: 'white', 
              border: '1px solid #00d4ff', 
              borderRadius: '8px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              marginTop: '10px'
            }}
            onMouseOver={(e) => {
              if(!loading) {
                e.currentTarget.style.backgroundColor = '#00d4ff';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if(!loading) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? "VERIFYING IDENTITY..." : "AUTHORIZE ACCESS"}
          </button>
        </form>

        {status && (
          <div style={{ 
            marginTop: '25px', 
            fontSize: '0.9rem',
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: status.includes("❌") ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)',
            color: status.includes("❌") || status.includes("FATAL") ? '#ff7675' : '#2ecc71',
            border: `1px solid ${status.includes("❌") ? 'rgba(231, 76, 60, 0.3)' : 'rgba(46, 204, 113, 0.3)'}`
          }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}