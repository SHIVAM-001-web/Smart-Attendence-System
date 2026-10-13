import React, { useEffect, useState } from 'react';
import API from '../services/api';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [studentsRes, reportsRes, sessionsRes] = await Promise.all([
        API.get('/students'),
        API.get('/attendance/report'),
        API.get('/sessions'),
      ]);
      setStudents(studentsRes.data);
      setReports(reportsRes.data.data || []);
      setSessions(sessionsRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      alert(error.response?.data?.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!className || !subject) return;

    try {
      await API.post('/sessions/start', {
        className,
        subject,
        startTime: new Date().toLocaleTimeString(),
        endTime: '05:00 PM',
      });
      alert('Session started successfully!');
      setClassName('');
      setSubject('');
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to start session');
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Admin Control Panel...</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 20px' }}>
      <h2>Admin System Operations</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', margin: '20px 0' }}>
        <div style={{ padding: '20px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
          <h4 style={{ margin: 0, color: '#0369a1' }}>Registered Students</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>{students.length}</p>
        </div>
        <div style={{ padding: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
          <h4 style={{ margin: 0, color: '#15803d' }}>Total Check-Ins Today</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>{reports.length}</p>
        </div>
        <div style={{ padding: '20px', background: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px' }}>
          <h4 style={{ margin: 0, color: '#a16207' }}>Active Class Sessions</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>
            {sessions.filter(s => s.status === 'ACTIVE').length}
          </p>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <h3>Start New Attendance Session</h3>
        <form onSubmit={handleCreateSession} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Class Name (e.g. CS - Section A)"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1' }}
          />
          <input
            type="text"
            placeholder="Subject (e.g. AI & ML)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: '1' }}
          />
          <button type="submit" style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Launch Session
          </button>
        </form>
      </div>

      <h3>Real-time Attendance Logs</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Student Name</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Time</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Status</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Method</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No check-ins recorded yet today.</td></tr>
          ) : (
            reports.map((rec) => (
              <tr key={rec._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px' }}>{rec.student?.user?.name || 'Student'}</td>
                <td style={{ padding: '12px' }}>{new Date(rec.timestamp).toLocaleString()}</td>
                <td style={{ padding: '12px', color: '#16a34a', fontWeight: 'bold' }}>{rec.status}</td>
                <td style={{ padding: '12px' }}>{rec.verificationMethod}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;