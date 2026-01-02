import { Router } from 'express';
import { 
  getServiceCategories, 
  createServiceCategory, 
  updateServiceCategory, 
  deleteServiceCategory 
} from '../controllers/serviceCategoryController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /service-categories - Get all service categories
router.get('/', getServiceCategories);

// POST /service-categories - Create new service category (HOST only)
router.post('/', requireRole(['HOST']), createServiceCategory);

// PUT /service-categories/:id - Update service category (HOST only)
router.put('/:id', requireRole(['HOST']), updateServiceCategory);

// DELETE /service-categories/:id - Delete service category (HOST only)
router.delete('/:id', requireRole(['HOST']), deleteServiceCategory);

export default router;