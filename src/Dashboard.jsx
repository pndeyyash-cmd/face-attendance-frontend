import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CSVLink } from "react-csv";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError("🔒 UNAUTHORIZED: Access Denied.");
        setLoading(false);
        return;
      }

      // Fetch Analytics
      const statsRes = await axios.get('https://face-attendance-backend-3o2a.onrender.com/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(statsRes.data);

      // Fetch Logs
      let url = 'https://face-attendance-backend-3o2a.onrender.com/logs';
      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
      } else if (startDate) {
        url += `?date=${startDate}`;
      }

      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLogs(response.data);
    } catch (err) {
      setError("❌ System Error: Failed to synchronize records.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const csvHeaders = [
    { label: "Date", key: "date" },
    { label: "Time", key: "time" },
    { label: "Identity Name", key: "name" },
    { label: "Security ID", key: "roll_number" },
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', 
      color: 'white',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: '2.5rem', 
          marginBottom: '10px', 
          background: 'linear-gradient(to right, #00dbde, #fc00ff)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          fontWeight: '800'
        }}>
          Enterprise Analytics Dashboard
        </h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '40px' }}>Real-time Monitoring & Personnel Intelligence</p>

        {/* --- Analytics Cards Section --- */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginBottom: '40px', 
          justifyContent: 'center' 
        }}>
          {[
            { label: "Total Personnel", value: stats.total, color: "#00d4ff" },
            { label: "Active Present", value: stats.present, color: "#2ecc71" },
            { label: "Awaiting Check-in", value: stats.absent, color: "#ff7675" }
          ].map((item, idx) => (
            <div key={idx} style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              padding: '25px', 
              borderRadius: '20px', 
              flex: 1, 
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '2rem', color: item.color }}>{item.value}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* --- Filter & Export Bar --- */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '20px', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between', 
          marginBottom: '30px', 
          background: 'rgba(255, 255, 255, 0.05)', 
          padding: '25px', 
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#00d4ff', fontWeight: 'bold' }}>START DATE</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#00d4ff', fontWeight: 'bold' }}>END DATE (OPTIONAL)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => {setStartDate(""); setEndDate("");}} style={{ padding: '12px 25px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Reset Filter</button>
            
            {logs.length > 0 && (
              <CSVLink 
                data={logs} 
                headers={csvHeaders} 
                filename={`security_report_${startDate || 'live'}.csv`}
                style={{ 
                  textDecoration: 'none', 
                  background: 'linear-gradient(45deg, #2ecc71, #27ae60)', 
                  color: 'white', 
                  padding: '12px 25px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)'
                }}
              >
                EXPORT LOGS
              </CSVLink>
            )}
          </div>
        </div>

        {/* --- Table Section --- */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h3 style={{ color: '#00d4ff', letterSpacing: '2px' }}>RETRIEVING AUDIT LOGS...</h3>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#ff7675', border: '1px solid #ff7675', borderRadius: '10px' }}>{error}</div>
        ) : (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            borderRadius: '20px', 
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left' }}>
                  <th style={{ padding: '20px' }}>Timestamp</th>
                  <th style={{ padding: '20px' }}>Check-in Time</th>
                  <th style={{ padding: '20px' }}>Identity Name</th>
                  <th style={{ padding: '20px', textAlign: 'right' }}>Security ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={`${log.roll_number}-${log.date}-${log.time}`} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '20px' }}>{log.date}</td>
                    <td style={{ padding: '20px', color: '#888' }}>{log.time}</td>
                    <td style={{ padding: '20px', fontWeight: '600' }}>{log.name}</td>
                    <td style={{ padding: '20px', color: '#00d4ff', fontWeight: 'bold', textAlign: 'right', fontFamily: 'monospace' }}>{log.roll_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#555' }}>No activity records detected for this period.</div>}
          </div>
        )}
      </div>
    </div>
  );
}