import { Router } from 'express';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController';
import { AuthMiddleware } from '../middleware/authMiddleware';
import { RoleMiddleware } from '../middleware/roleMiddleware';

const router = Router();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// GET /categories - Get all call categories
router.get('/', getCategories);

// POST /categories - Create new call category (HOST only)
router.post('/', RoleMiddleware.requireHost(), createCategory);

// PUT /categories/:id - Update call category (HOST only)
router.put('/:id', RoleMiddleware.requireHost(), updateCategory);

// DELETE /categories/:id - Delete call category (HOST only)
router.delete('/:id', RoleMiddleware.requireHost(), deleteCategory);

export default router;