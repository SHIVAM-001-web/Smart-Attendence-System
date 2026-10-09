import express from 'express';
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getMyStudentProfile,
} from '../controllers/studentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student routes
router
  .route('/')
  .post(protect, admin, createStudent)
  .get(protect, admin, getStudents);

router.get('/profile/me', protect, getMyStudentProfile);

router
  .route('/:id')
  .get(protect, getStudentById)
  .put(protect, admin, updateStudent)
  .delete(protect, admin, deleteStudent);

export default router;