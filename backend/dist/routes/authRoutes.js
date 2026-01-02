"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
// Public routes
router.post('/login', rateLimitMiddleware_1.RateLimitMiddleware.loginLimiter, rateLimitMiddleware_1.RateLimitMiddleware.checkAccountLockout, validationMiddleware_1.ValidationMiddleware.validateBody(validation_1.loginSchema), authController_1.AuthController.login);
// Protected routes
router.get('/me', authMiddleware_1.AuthMiddleware.authenticate, authController_1.AuthController.getMe);
router.post('/verify-secret', authMiddleware_1.AuthMiddleware.authenticate, authController_1.AuthController.verifySecret);
router.post('/forgot-password', authMiddleware_1.AuthMiddleware.authenticate, validationMiddleware_1.ValidationMiddleware.validateBody(validation_1.forgotPasswordSchema), authController_1.AuthController.forgotPassword);
router.post('/verify-otp', authMiddleware_1.AuthMiddleware.authenticate, validationMiddleware_1.ValidationMiddleware.validateBody(validation_1.verifyOtpSchema), authController_1.AuthController.verifyOTP);
router.post('/reset-password', authMiddleware_1.AuthMiddleware.authenticate, validationMiddleware_1.ValidationMiddleware.validateBody(validation_1.resetPasswordSchema), authController_1.AuthController.resetPassword);
router.post('/validate-password', authController_1.AuthController.validatePassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map