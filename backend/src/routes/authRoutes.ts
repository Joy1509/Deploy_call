import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.post('/verify-secret', authMiddleware, authController.verifySecret);
router.post('/forgot-password', authMiddleware, authController.forgotPassword);
router.post('/verify-otp', authMiddleware, authController.verifyOTP);
router.post('/reset-password', authMiddleware, authController.resetPassword);

export default router;