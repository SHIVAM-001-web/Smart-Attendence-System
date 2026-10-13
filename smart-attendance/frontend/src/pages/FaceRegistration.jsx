import React, { useState, useEffect } from 'react';
import FaceScanner from '../components/FaceScanner';
import API from '../services/api';

const FaceRegistration = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get('/students');
        setStudents(res.data);
        if (res.data.length > 0) {
          setSelectedStudentId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      }
    };
    fetchStudents();
  }, []);

  const handleFaceScan = async (descriptorArray) => {
    if (isProcessing || !selectedStudentId) return;

    // Instantly lock loop execution
    setIsProcessing(true);
    setMessage('Registering face data on server...');

    try {
      const res = await API.post('/face/register', {
        studentId: selectedStudentId,
        descriptors: [descriptorArray], // Pass 2D array of 128D floats
        qualityScore: 1.0,
      });

      setStatus('success');
      setMessage(res.data.message || 'Face registered successfully!');
    } catch (error) {
      console.error('Face Registration Error:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Face registration failed.');
      
      // Auto unlock after 3 seconds on failure so user can try again
      setTimeout(() => setIsProcessing(false), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', textAlign: 'center' }}>
      <h2>Student Face Registration</h2>
      <p style={{ color: '#64748b' }}>Select student and look directly at the camera</p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Student: </label>
        <select
          value={selectedStudentId}
          onChange={(e) => {
            setSelectedStudentId(e.target.value);
            setStatus(null);
            setMessage('');
            setIsProcessing(false);
          }}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        >
          {students.map((stu) => (
            <option key={stu._id} value={stu._id}>
              {stu.user?.name || 'Student'} ({stu.studentId})
            </option>
          ))}
        </select>
      </div>

      {status === 'success' ? (
        <div style={{ padding: '20px', background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '8px' }}>
          <h3 style={{ color: '#16a34a' }}>{message}</h3>
          <button
            onClick={() => { 
              setStatus(null); 
              setMessage(''); 
              setIsProcessing(false); 
            }}
            style={{ marginTop: '10px', padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Register Another Face
          </button>
        </div>
      ) : (
        <>
          <FaceScanner onFaceDetected={handleFaceScan} isProcessing={isProcessing} />
          {message && (
            <p style={{ color: status === 'error' ? '#dc2626' : '#2563eb', marginTop: '10px', fontWeight: 'bold' }}>
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default FaceRegistration;