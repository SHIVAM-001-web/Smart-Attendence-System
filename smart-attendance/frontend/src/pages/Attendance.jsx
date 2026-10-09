import React, { useState } from 'react';
import FaceScanner from '../components/FaceScanner';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Scanner se 128D vector array milne par trigger hota hai
  const handleFaceDetected = async (descriptorArray) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Step 1: Verify Face Embeddings via Backend API
      const verifyRes = await API.post('/face/verify', {
        liveDescriptor: descriptorArray,
      });

      if (verifyRes.data.success) {
        const studentId = verifyRes.data.student._id;

        // Step 2: Session Active Check & Mark Attendance API Call
        // (Assuming session ID default or dynamically fetched)
        const attendanceRes = await API.post('/attendance/mark', {
          studentId: studentId,
          sessionId: 'DEFAULT_ACTIVE_SESSION_ID', // Replaced with selected active session
          verificationMethod: 'FACE_RECOGNITION',
        });

        setAttendanceResult({
          success: true,
          message: attendanceRes.data.message,
          studentName: verifyRes.data.student.user.name,
          confidence: verifyRes.data.confidence,
          time: new Date().toLocaleTimeString(),
        });
      }
    } catch (error) {
      console.error('Attendance Failed:', error);
      setErrorMessage(
        error.response?.data?.message || 'Verification or Attendance marking failed.'
      );
      // Brief pause before allowing re-scan attempt
      setTimeout(() => setIsProcessing(false), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 20px', textAlign: 'center' }}>
      <h2>Smart Attendance Camera Portal</h2>
      <p style={{ color: '#64748b' }}>Position your face inside the box for automated check-in</p>

      {attendanceResult ? (
        <div style={{ padding: '30px', background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '12px' }}>
          <h3 style={{ color: '#15803d', margin: 0 }}>✓ Attendance Marked Successfully!</h3>
          <p><strong>Student:</strong> {attendanceResult.studentName}</p>
          <p><strong>Confidence:</strong> {attendanceResult.confidence}</p>
          <p><strong>Time:</strong> {attendanceResult.time}</p>
          <button
            onClick={() => { setAttendanceResult(null); setIsProcessing(false); }}
            style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Mark Next Student
          </button>
        </div>
      ) : (
        <>
          <FaceScanner onFaceDetected={handleFaceDetected} isProcessing={isProcessing} />
          
          {errorMessage && (
            <div style={{ marginTop: '15px', color: '#dc2626', background: '#fef2f2', padding: '10px', borderRadius: '6px' }}>
              {errorMessage}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Attendance;