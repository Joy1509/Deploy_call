import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { loginSchema, forgotPasswordSchema, verifyOTPSchema, resetPasswordSchema, verifySecretSchema } from '../../schemas/authSchemas';
import * as authController from '../../controllers/authController';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/login-status', authController.checkLoginStatus);
router.get('/me', authMiddleware, authController.getMe);
router.post('/verify-secret', authMiddleware, validate(verifySecretSchema), authController.verifySecret);
router.post('/forgot-password', authMiddleware, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/verify-otp', authMiddleware, validate(verifyOTPSchema), authController.verifyOTP);
router.post('/reset-password', authMiddleware, validate(resetPasswordSchema), authController.resetPassword);

export default router;