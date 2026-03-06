import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Scanner from './Scanner';
import Register from './Register';
import Dashboard from './Dashboard';
import Login from './Login';
import ManageStudents from './ManageStudents';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    window.location.href = "/"; 
  };

  const navLinkStyle = {
    color: '#00d4ff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    padding: '8px 15px',
    borderRadius: '6px',
    transition: '0.3s all'
  };

  return (
    <BrowserRouter>
      {/* Root container: No padding at top to kill the black bar */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0f0c29' }}>
        
        {/* Navigation: Sticky Glassmorphism Header */}
        <nav style={{ 
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', 
          padding: '10px 0',
          background: 'rgba(0, 0, 0, 0.4)', 
          backdropFilter: 'blur(15px)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
          position: 'sticky', top: 0, zIndex: 1000 
        }}>
          <Link to="/" style={navLinkStyle}>Scanner</Link>
          
          {isAdmin ? (
            <>
              <Link to="/register" style={navLinkStyle}>Register</Link>
              <Link to="/dashboard" style={navLinkStyle}>Logs</Link>
              <Link to="/manage-students" style={navLinkStyle}>Management</Link>
              <button onClick={handleLogout} style={{ 
                background: '#ff4757', color: 'white', border: 'none', 
                padding: '6px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' 
              }}>LOGOUT</button>
            </>
          ) : (
            <Link to="/login" style={{...navLinkStyle, color: '#fc00ff'}}>Admin Login</Link>
          )}
        </nav>

        {/* Content Area: flex: 1 ensures it pushes the footer to the bottom */}
        <main style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Scanner />} />
            <Route path="/login" element={<Login onLoginSuccess={() => setIsAdmin(true)} />} />
            <Route path="/register" element={isAdmin ? <Register /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={isAdmin ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/manage-students" element={isAdmin ? <ManageStudents /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        {/* Branding Footer: Glossy & Metallic Finish */}
        <footer style={{ 
          padding: '20px 0', 
          background: 'rgba(0,0,0,0.8)', 
          borderTop: '1px solid rgba(0, 212, 255, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#666', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            System Architecture Developed By
          </p>
          <h3 style={{ 
            margin: '5px 0 0 0',
            fontStyle: 'italic',
            fontWeight: '900',
            fontSize: '1.4rem',
            background: 'linear-gradient(90deg, #00dbde, #fc00ff, #00dbde)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'glossy-flow 3s linear infinite',
            filter: 'drop-shadow(0px 0px 5px rgba(0, 212, 255, 0.3))'
          }}>
            Yash Vardhan Pandey
          </h3>
        </footer>

        <style>{`
          @keyframes glossy-flow {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          /* This fixes the gap between App.jsx and the children's backgrounds */
          main > div {
            min-height: auto !important;
            padding-top: 20px !important;
          }
        `}</style>
      </div>
    </BrowserRouter>
  );
}