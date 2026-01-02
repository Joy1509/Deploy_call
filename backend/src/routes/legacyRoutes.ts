import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { UserController } from '../controllers/userController';
import { AuthMiddleware } from '../middleware/authMiddleware';
import { RoleMiddleware } from '../middleware/roleMiddleware';
import { ValidationMiddleware } from '../middleware/validationMiddleware';
import { RateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import { 
  loginSchema, 
  createUserSchema, 
  updateUserSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema
} from '../utils/validation';
import { prisma } from '../config/database';

const router = Router();

// Legacy auth routes (for backward compatibility)
router.post('/auth/login', 
  RateLimitMiddleware.loginLimiter,
  RateLimitMiddleware.checkAccountLockout,
  ValidationMiddleware.validateBody(loginSchema),
  AuthController.login
);

router.get('/auth/me', 
  AuthMiddleware.authenticate, 
  AuthController.getMe
);

router.post('/auth/verify-secret', 
  AuthMiddleware.authenticate,
  AuthController.verifySecret
);

router.post('/auth/forgot-password', 
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateBody(forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post('/auth/verify-otp', 
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateBody(verifyOtpSchema),
  AuthController.verifyOTP
);

router.post('/auth/reset-password', 
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateBody(resetPasswordSchema),
  AuthController.resetPassword
);

// Legacy user routes (for backward compatibility)
router.get('/users', 
  AuthMiddleware.authenticate,
  RoleMiddleware.requireHostOrAdmin(),
  UserController.getAllUsers
);

router.post('/users', 
  AuthMiddleware.authenticate,
  RoleMiddleware.requireHost(),
  ValidationMiddleware.validateBody(createUserSchema),
  UserController.createUser
);

router.put('/users/:id', 
  AuthMiddleware.authenticate,
  RoleMiddleware.requireHost(),
  ValidationMiddleware.validateBody(updateUserSchema),
  UserController.updateUser
);

router.delete('/users/:id', 
  AuthMiddleware.authenticate,
  RoleMiddleware.requireHost(),
  UserController.deleteUser
);

// Legacy health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Legacy API is running (deprecated - use /api/v1/health)',
    timestamp: new Date().toISOString()
  });
});

// Legacy notification routes
router.get('/notifications/unread-count', AuthMiddleware.authenticate, async (req, res) => {
  try {
    if (!req.user?.username) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const count = await prisma.notification.count({
      where: { 
        userId: req.user.username,
        isRead: false
      }
    });
    res.json({ count });
  } catch (err: any) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/notifications', AuthMiddleware.authenticate, async (req, res) => {
  try {
    if (!req.user?.username) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.username },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: String(err) });
  }
});

// Legacy call routes
router.get('/calls', AuthMiddleware.authenticate, async (req, res) => {
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
    
    const findArgs: any = {};
    if (Object.keys(whereClause).length > 0) findArgs.where = whereClause;
    const calls = await prisma.call.findMany(findArgs);
    res.json(calls);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch calls', details: String(err) });
  }
});

// Legacy category routes (for regular calls)
router.get('/categories', AuthMiddleware.authenticate, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (err: any) {
    // Return mock call categories when database is unavailable
    res.json([
      { id: 1, name: 'Technical Support', isActive: true },
      { id: 2, name: 'Installation', isActive: true },
      { id: 3, name: 'Maintenance', isActive: true }
    ]);
  }
});

// Legacy customer routes
router.get('/customers', AuthMiddleware.authenticate, async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;