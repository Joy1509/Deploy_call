import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middleware/auth';
import * as customerController from '../../controllers/customerController';
const router = Router();
router.get('/', authMiddleware, customerController.getCustomers);
router.get('/phone/:phone', authMiddleware, customerController.getCustomerByPhone);
router.get('/analytics', authMiddleware, requireRole(['HOST']), customerController.getCustomerAnalytics);
router.get('/directory', authMiddleware, customerController.getCustomerDirectory);
export default router;
//# sourceMappingURL=customerRoutes.js.map