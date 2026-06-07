import express from 'express';
import {
  registerUser,
  verifyEmail,
  loginUser,
  verifyOTP,
  logoutUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/logout', protect, logoutUser);

export default router;
