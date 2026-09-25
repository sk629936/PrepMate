import { Router } from 'express';
import { signup, login, getMe, forgotPassword, verifyOtp, resendOtp, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me (Protected route)
router.get('/me', authenticate, getMe);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOtp);

// POST /api/auth/resend-otp
router.post('/resend-otp', resendOtp);

// POST /api/auth/reset-password
// The resetToken in the request body IS the authorization proof.
// No additional auth middleware needed — token is verified inside the controller.
router.post('/reset-password', resetPassword);

export default router;
