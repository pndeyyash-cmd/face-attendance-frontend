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
    // Sync login state with local storage on load
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    window.location.href = "/"; 
  };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#1a1a1a', color: 'white', paddingTop: '40px' }}>
        
        {/* Navigation Bar */}
        <nav style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', padding: '15px 40px', backgroundColor: '#333', borderRadius: '10px', marginBottom: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>Scanner</Link>
          
          {isAdmin ? (
            <>
              <Link to="/register" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>Register</Link>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>Logs</Link>
              <Link to="/manage-students" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>Management</Link>
              <button onClick={handleLogout} style={{ backgroundColor: '#ff4c4c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
            </>
          ) : (
            <Link to="/login" style={{ color: '#007BFF', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>Admin Login</Link>
          )}
        </nav>

        {/* Content Area */}
        <div style={{ width: '100%', flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Routes>
            <Route path="/" element={<Scanner />} />
            <Route path="/login" element={<Login onLoginSuccess={() => setIsAdmin(true)} />} />
            <Route path="/register" element={isAdmin ? <Register /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={isAdmin ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/manage-students" element={isAdmin ? <ManageStudents /> : <Navigate to="/login" />} />
          </Routes>
        </div>

        {/* Global Branding Footer */}
        <footer style={{ marginTop: '50px', padding: '30px', color: '#777', fontSize: '14px', borderTop: '1px solid #333', width: '100%', textAlign: 'center' }}>
          Developed by <strong style={{ color: '#aaa' }}>Yash Vardhan Pandey</strong>
        </footer>

      </div>
    </BrowserRouter>
  );
}