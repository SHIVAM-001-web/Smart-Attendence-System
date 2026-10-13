import React, { useState, useEffect } from 'react';
import FaceScanner from '../components/FaceScanner';
import API from '../services/api';

const Attendance = () => {
  const [activeSession, setActiveSession] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch Active Session automatically
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await API.get('/sessions');
        const active = res.data.find((s) => s.status === 'ACTIVE');
        if (active) {
          setActiveSession(active);
        }
      } catch (err) {
        console.warn('Could not fetch active session, falling back to server default.');
      }
    };
    fetchSession();
  }, []);

  const handleFaceDetected = async (descriptorArray) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Step A: Biometric Euclidean Matching
      const verifyRes = await API.post('/face/verify', {
        liveDescriptor: descriptorArray,
      });

      if (verifyRes.data.success) {
        const studentId = verifyRes.data.student._id;

        // Step B: Record Attendance
        const attendanceRes = await API.post('/attendance/mark', {
          studentId: studentId,
          sessionId: activeSession ? activeSession._id : null,
          verificationMethod: 'FACE_RECOGNITION',
          confidenceScore: parseFloat(verifyRes.data.confidence),
        });

        setAttendanceResult({
          success: true,
          message: attendanceRes.data.message,
          studentName: verifyRes.data.student.user?.name || 'Student',
          studentId: verifyRes.data.student.studentId,
          confidence: verifyRes.data.confidence,
          time: new Date().toLocaleTimeString(),
        });
      }
    } catch (error) {
      console.error('Attendance Verification Error:', error);
      setErrorMessage(
        error.response?.data?.message || 'Verification failed. Face not recognized or duplicate entry.'
      );
      setTimeout(() => setIsProcessing(false), 3500);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 20px', textAlign: 'center' }}>
      <h2>Smart AI Attendance Portal</h2>
      {activeSession ? (
        <p style={{ color: '#16a34a', fontWeight: 'bold' }}>
          Active Session: {activeSession.className} — {activeSession.subject}
        </p>
      ) : (
        <p style={{ color: '#0284c7', fontWeight: '500' }}>
          System Mode: General Attendance Check-In
        </p>
      )}

      {attendanceResult ? (
        <div style={{ padding: '30px', background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '12px', marginTop: '20px' }}>
          <h3 style={{ color: '#15803d', margin: '0 0 10px 0' }}>✓ Attendance Marked Successfully!</h3>
          <p style={{ margin: '5px 0' }}><strong>Student Name:</strong> {attendanceResult.studentName}</p>
          <p style={{ margin: '5px 0' }}><strong>Student ID:</strong> {attendanceResult.studentId}</p>
          <p style={{ margin: '5px 0' }}><strong>Match Confidence:</strong> {attendanceResult.confidence}</p>
          <p style={{ margin: '5px 0' }}><strong>Check-In Time:</strong> {attendanceResult.time}</p>
          <button
            onClick={() => { setAttendanceResult(null); setIsProcessing(false); }}
            style={{ marginTop: '15px', padding: '10px 24px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Scan Next Student
          </button>
        </div>
      ) : (
        <>
          <FaceScanner onFaceDetected={handleFaceDetected} isProcessing={isProcessing} />
          {errorMessage && (
            <div style={{ marginTop: '15px', color: '#dc2626', background: '#fef2f2', padding: '12px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
              {errorMessage}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Attendance;