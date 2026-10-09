import express from 'express';
import {
  createSession,
  getSessions,
  updateSessionStatus,
} from '../controllers/sessionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, admin, createSession)
  .get(protect, getSessions);

router.put('/:id/status', protect, admin, updateSessionStatus);

export default router;