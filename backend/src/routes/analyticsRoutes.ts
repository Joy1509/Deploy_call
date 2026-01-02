import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { AuthMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(AuthMiddleware.authenticate);

// Analytics routes
router.get('/engineers', AnalyticsController.getEngineerAnalytics);

export default router;