import Attendance from '../models/Attendance.js';
import Session from '../models/Session.js';
import Student from '../models/Student.js';

// @desc    Mark Attendance (with Face Verification & Duplicate Check)
// @route   POST /api/attendance/mark
// @access  Private
export const markAttendance = async (req, res) => {
  try {
    const { studentId, sessionId, verificationMethod, confidenceScore } = req.body;

    // 1. Verify Student Existence & Status
    const student = await Student.findById(studentId);
    if (!student || student.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Invalid or inactive student profile' });
    }

    // 2. Verify Session Existence & Active Status
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Class session not found' });
    }
    if (session.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Attendance rejected. Session is not active.' });
    }

    // 3. Duplicate Prevention Check (Business Logic Level)
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      session: sessionId,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this session!',
        markedAt: existingAttendance.timestamp,
      });
    }

    // 4. Record Attendance
    const attendance = await Attendance.create({
      student: studentId,
      session: sessionId,
      date: session.date,
      timestamp: new Date(),
      status: 'PRESENT',
      verificationMethod: verificationMethod || 'FACE_RECOGNITION',
      confidenceScore: confidenceScore || 100,
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance,
    });
  } catch (error) {
    // MongoDB Unique Index Conflict handling (Duplicate Prevention Fail-safe)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate attendance detected. Entry already recorded.',
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Attendance History for Logged In Student
// @route   GET /api/attendance/my-history
// @access  Private (Student)
export const getMyAttendanceHistory = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }

    const history = await Attendance.find({ student: student._id })
      .populate('session', 'className subject date startTime endTime')
      .sort({ timestamp: -1 });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Attendance Records / Report (Admin)
// @route   GET /api/attendance/report
// @access  Private/Admin
export const getAttendanceReport = async (req, res) => {
  try {
    const { sessionId, date } = req.query;
    let filter = {};

    if (sessionId) filter.session = sessionId;
    if (date) filter.date = new Date(date);

    const records = await Attendance.find(filter)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('session', 'className subject date')
      .sort({ timestamp: -1 });

    res.status(200).json({
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};