import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../middleware/authMiddleware';
import { ValidationMiddleware } from '../middleware/validationMiddleware';
import { RateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import { 
  loginSchema, 
  forgotPasswordSchema, 
  verifyOtpSchema, 
  resetPasswordSchema 
} from '../utils/validation';

const router = Router();

// Public routes
router.post('/login', 
  RateLimitMiddleware.loginLimiter,
  RateLimitMiddleware.checkAccountLockout,
  ValidationMiddleware.validateBody(loginSchema),
  AuthController.login
);

// Protected routes
router.get('/me', 
  AuthMiddleware.authenticate, 
  AuthController.getMe
);

router.post('/verify-secret', 
  AuthMiddleware.authenticate,
  AuthController.verifySecret
);

router.post('/forgot-password', 
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateBody(forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post('/verify-otp', 
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateBody(verifyOtpSchema),
  AuthController.verifyOTP
);

router.post('/reset-password', 
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateBody(resetPasswordSchema),
  AuthController.resetPassword
);

router.post('/validate-password',
  AuthController.validatePassword
);

export default router;