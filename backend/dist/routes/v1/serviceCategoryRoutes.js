import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middleware/auth';
import * as categoryController from '../../controllers/categoryController';
const router = Router();
// Service Categories
router.get('/', authMiddleware, categoryController.getServiceCategories);
router.post('/', authMiddleware, requireRole(['HOST']), categoryController.createServiceCategory);
router.put('/:id', authMiddleware, requireRole(['HOST']), categoryController.updateServiceCategory);
router.delete('/:id', authMiddleware, requireRole(['HOST']), categoryController.deleteServiceCategory);
export default router;
//# sourceMappingURL=serviceCategoryRoutes.js.map