import React, { useState } from 'react';
import FaceScanner from '../components/FaceScanner';
import API from '../services/api';

const FaceRegistration = ({ studentId }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  const handleFaceScan = async (descriptorArray) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setMessage('');

    try {
      const res = await API.post('/face/register', {
        studentId: studentId,
        descriptors: [descriptorArray], // Pass vector embedding
        qualityScore: 1.0,
      });

      setStatus('success');
      setMessage(res.data.message || 'Face registered successfully!');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Face registration failed.');
      setTimeout(() => setIsProcessing(false), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', textAlign: 'center' }}>
      <h2>Student Face Registration</h2>
      <p style={{ color: '#64748b' }}>Look directly at the camera to register biometric descriptors</p>

      {status === 'success' ? (
        <div style={{ padding: '20px', background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '8px' }}>
          <h3 style={{ color: '#16a34a' }}>{message}</h3>
        </div>
      ) : (
        <>
          <FaceScanner onFaceDetected={handleFaceScan} isProcessing={isProcessing} />
          {message && (
            <p style={{ color: status === 'error' ? '#dc2626' : '#2563eb', marginTop: '10px' }}>
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default FaceRegistration;