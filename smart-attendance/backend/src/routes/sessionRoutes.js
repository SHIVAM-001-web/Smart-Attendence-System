import express from 'express';
import { startSession, getSessions } from '../controllers/sessionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getSessions);
router.post('/start', protect, authorize('ADMIN'), startSession);

export default router;