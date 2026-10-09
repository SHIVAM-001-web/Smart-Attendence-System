import express from 'express';
import {
  markAttendance,
  getMyAttendanceHistory,
  getAttendanceReport,
} from '../controllers/attendanceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/mark', protect, markAttendance);
router.get('/my-history', protect, getMyAttendanceHistory);
router.get('/report', protect, admin, getAttendanceReport);

export default router;