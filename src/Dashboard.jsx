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
        setError("🔒 UNAUTHORIZED: Please login as an admin.");
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
      setError("FATAL ERROR: Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const csvHeaders = [
    { label: "Date", key: "date" },
    { label: "Time", key: "time" },
    { label: "Student Name", key: "name" },
    { label: "Roll Number", key: "roll_number" },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingBottom: '50px' }}>
      
      {/* Analytics Cards Section */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', width: '90%', maxWidth: '1000px', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#007BFF', padding: '20px', borderRadius: '10px', flex: 1, textAlign: 'center' }}>
          <h3 style={{ margin: 0 }}>{stats.total}</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Total Students</p>
        </div>
        <div style={{ backgroundColor: '#28a745', padding: '20px', borderRadius: '10px', flex: 1, textAlign: 'center' }}>
          <h3 style={{ margin: 0 }}>{stats.present}</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Present Today</p>
        </div>
        <div style={{ backgroundColor: '#dc3545', padding: '20px', borderRadius: '10px', flex: 1, textAlign: 'center' }}>
          <h3 style={{ margin: 0 }}>{stats.absent}</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Absent Today</p>
        </div>
      </div>

      <h2 style={{ marginBottom: '20px', fontSize: '28px', borderBottom: '2px solid #007BFF', paddingBottom: '10px' }}>Attendance History</h2>

      {/* Filter & Export Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '30px', backgroundColor: '#333', padding: '20px', borderRadius: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12px', color: '#aaa' }}>From / Single Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#444', color: 'white' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12px', color: '#aaa' }}>To (Optional Range)</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#444', color: 'white' }} />
        </div>
        <button onClick={() => {setStartDate(""); setEndDate("");}} style={{ padding: '10px 20px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Reset</button>
        
        {logs.length > 0 && (
          <CSVLink 
            data={logs} 
            headers={csvHeaders} 
            filename={`attendance_report_${startDate || 'today'}.csv`}
            style={{ textDecoration: 'none', backgroundColor: '#28a745', color: 'white', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold' }}
          >
            Download CSV
          </CSVLink>
        )}
      </div>

      {loading ? <h3>Fetching Records...</h3> : error ? <h3 style={{ color: '#ff4c4c' }}>{error}</h3> : (
        <div style={{ overflowX: 'auto', width: '90%', maxWidth: '1000px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#222', borderRadius: '8px', overflow: 'hidden' }}>
            <thead style={{ backgroundColor: '#007BFF' }}>
              <tr>
                <th style={{ padding: '15px' }}>Date</th>
                <th style={{ padding: '15px' }}>Time</th>
                <th style={{ padding: '15px' }}>Name</th>
                <th style={{ padding: '15px' }}>Roll Number</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={`${log.roll_number}-${log.date}-${log.time}`} style={{ borderBottom: '1px solid #444', backgroundColor: index % 2 === 0 ? '#2a2a2a' : '#222', textAlign: 'center' }}>
                  <td style={{ padding: '15px' }}>{log.date}</td>
                  <td style={{ padding: '15px', color: '#aaa' }}>{log.time}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{log.name}</td>
                  <td style={{ padding: '15px', color: '#f39c12', fontWeight: 'bold' }}>{log.roll_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <h4 style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>No records found.</h4>}
        </div>
      )}
    </div>
  );
}