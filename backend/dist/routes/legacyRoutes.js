"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const validation_1 = require("../utils/validation");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// Legacy auth routes (for backward compatibility)
router.post('/auth/login', rateLimitMiddleware_1.RateLimitMiddleware.loginLimiter, rateLimitMiddleware_1.RateLimitMiddleware.checkAccountLockout, validationMiddleware_1.ValidationMiddleware.validateBody(validation_1.loginSchema), authController_1.AuthController.login);
router.get('/auth/me', authMiddleware_1.AuthMiddleware.authenticate, authController_1.AuthController.getMe);
router.post('/auth/verify-secret', authMiddleware_1.AuthMiddleware.authenticate, authController_1.AuthController.verifySecret);
router.post('/auth/forgot-password', authMiddleware_1.AuthMiddleware.authenticate, validationMiddleware_1.ValidationMiddleware.validateBody(validation_1.forgotPasswordSchema), authController_1.AuthController.forgotPassword);
router.post('/auth/verify-otp', authMiddleware_1.AuthMiddleware.authenticate, validationMiddleware_1.ValidationMiddleware.validateBody(validation_1.verifyOtpSchema), authController_1.AuthController.verifyOTP);
router.post('/auth/reset-password', authMiddleware_1.AuthMiddleware.authenticate, validationMiddleware_1.ValidationMiddleware.validateBody(validation_1.resetPasswordSchema), authController_1.AuthController.resetPassword);
// Legacy user routes (for backward compatibility)
router.get('/users', authMiddleware_1.AuthMiddleware.authenticate, roleMiddleware_1.RoleMiddleware.requireHostOrAdmin(), userController_1.UserController.getAllUsers);
router.post('/users', authMiddleware_1.AuthMiddleware.authenticate, roleMiddleware_1.RoleMiddleware.requireHost(), validationMiddleware_1.ValidationMiddleware.validateBody(validation_1.createUserSchema), userController_1.UserController.createUser);
router.put('/users/:id', authMiddleware_1.AuthMiddleware.authenticate, roleMiddleware_1.RoleMiddleware.requireHost(), validationMiddleware_1.ValidationMiddleware.validateBody(validation_1.updateUserSchema), userController_1.UserController.updateUser);
router.delete('/users/:id', authMiddleware_1.AuthMiddleware.authenticate, roleMiddleware_1.RoleMiddleware.requireHost(), userController_1.UserController.deleteUser);
// Legacy health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Legacy API is running (deprecated - use /api/v1/health)',
        timestamp: new Date().toISOString()
    });
});
// Legacy notification routes
router.get('/notifications/unread-count', authMiddleware_1.AuthMiddleware.authenticate, async (req, res) => {
    try {
        if (!req.user?.username) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const count = await database_1.prisma.notification.count({
            where: {
                userId: req.user.username,
                isRead: false
            }
        });
        res.json({ count });
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
router.get('/notifications', authMiddleware_1.AuthMiddleware.authenticate, async (req, res) => {
    try {
        if (!req.user?.username) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const notifications = await database_1.prisma.notification.findMany({
            where: { userId: req.user.username },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(notifications);
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
// Legacy call routes
router.get('/calls', authMiddleware_1.AuthMiddleware.authenticate, async (req, res) => {
    try {
        const userRole = req.user?.role;
        const username = req.user?.username;
        let whereClause = {};
        if (userRole === 'ENGINEER') {
            whereClause = {
                OR: [
                    { createdBy: username },
                    { assignedTo: username }
                ]
            };
        }
        const findArgs = {};
        if (Object.keys(whereClause).length > 0)
            findArgs.where = whereClause;
        const calls = await database_1.prisma.call.findMany(findArgs);
        res.json(calls);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch calls', details: String(err) });
    }
});
// Legacy category routes
router.get('/categories', authMiddleware_1.AuthMiddleware.authenticate, async (req, res) => {
    try {
        const categories = await database_1.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
// Legacy customer routes
router.get('/customers', authMiddleware_1.AuthMiddleware.authenticate, async (req, res) => {
    try {
        const customers = await database_1.prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(customers);
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
exports.default = router;
//# sourceMappingURL=legacyRoutes.js.map