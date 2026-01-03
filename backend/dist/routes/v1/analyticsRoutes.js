import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middleware/auth';
import * as analyticsController from '../../controllers/analyticsController';
const router = Router();
router.get('/engineers', authMiddleware, requireRole(['HOST']), analyticsController.getEngineerAnalytics);
export default router;
//# sourceMappingURL=analyticsRoutes.js.map