import express from 'express';
import {
  registerFace,
  verifyFace,
  getFaceStatus,
} from '../controllers/faceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', protect, registerFace);
router.post('/verify', protect, verifyFace);
router.get('/status/:studentId', protect, getFaceStatus);

export default router;