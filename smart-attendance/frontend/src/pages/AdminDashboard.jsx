import React, { useEffect, useState } from 'react';
import API from '../services/api';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, reportsRes] = await Promise.all([
          API.get('/students'),
          API.get('/attendance/report'),
        ]);

        setStudents(studentsRes.data);
        setReports(reportsRes.data.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Admin Panel...</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 20px' }}>
      <h2>Admin Control Panel</h2>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', margin: '20px 0' }}>
        <div style={{ padding: '20px', background: '#e0f2fe', borderRadius: '8px' }}>
          <h3>Total Students</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{students.length}</p>
        </div>
        <div style={{ padding: '20px', background: '#dcfce7', borderRadius: '8px' }}>
          <h3>Attendance Records</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{reports.length}</p>
        </div>
        <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '8px' }}>
          <h3>System Status</h3>
          <p style={{ fontSize: '1.2rem', color: '#d97706', margin: 0, fontWeight: 'bold' }}>Active & Monitoring</p>
        </div>
      </div>

      {/* Recent Attendance Records */}
      <h3 style={{ marginTop: '2rem' }}>Recent Attendance Activity</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Student Name</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Date & Time</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Status</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Method</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((record) => (
            <tr key={record._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px' }}>{record.student?.user?.name || 'N/A'}</td>
              <td style={{ padding: '12px' }}>{new Date(record.timestamp).toLocaleString()}</td>
              <td style={{ padding: '12px', color: '#16a34a', fontWeight: 'bold' }}>{record.status}</td>
              <td style={{ padding: '12px' }}>{record.verificationMethod}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;