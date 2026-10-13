import Attendance from '../models/Attendance.js';
import Session from '../models/Session.js';
import Student from '../models/Student.js';

export const markAttendance = async (req, res) => {
  try {
    const { studentId, sessionId, verificationMethod, confidenceScore } = req.body;

    let targetSessionId = sessionId;

    if (!targetSessionId || targetSessionId === 'DEFAULT_ACTIVE_SESSION_ID') {
      const activeSession = await Session.findOne({ status: 'ACTIVE' });
      if (activeSession) {
        targetSessionId = activeSession._id;
      } else {
        let defaultSession = await Session.findOne({ className: 'General Batch', status: 'ACTIVE' });
        if (!defaultSession) {
          defaultSession = await Session.create({
            className: 'General Batch',
            subject: 'Daily Attendance',
            date: new Date(),
            startTime: '08:00 AM',
            endTime: '08:00 PM',
            status: 'ACTIVE',
          });
        }
        targetSessionId = defaultSession._id;
      }
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingRecord = await Attendance.findOne({
      student: studentId,
      session: targetSessionId,
      timestamp: { $gte: startOfDay },
    });

    if (existingRecord) {
      return res.status(400).json({
        message: `Attendance already marked today at ${new Date(existingRecord.timestamp).toLocaleTimeString()}!`,
      });
    }

    const attendance = await Attendance.create({
      student: studentId,
      session: targetSessionId,
      status: 'PRESENT',
      verificationMethod: verificationMethod || 'FACE_RECOGNITION',
      confidenceScore: confidenceScore || 0.95,
      timestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully!',
      data: attendance,
    });
  } catch (error) {
    console.error('Mark Attendance Error:', error);
    res.status(500).json({ message: 'Internal Server Error during attendance logging.' });
  }
};

export const getMyAttendanceHistory = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found for this user.' });
    }

    const history = await Attendance.find({ student: student._id })
      .populate('session')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error('Fetch History Error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance history.' });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const reports = await Attendance.find()
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('session')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('Fetch Report Error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance reports.' });
  }
};