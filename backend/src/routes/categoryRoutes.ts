import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import * as categoryController from '../controllers/categoryController';

const router = Router();

// Categories
router.get('/', authMiddleware, categoryController.getCategories);
router.post('/', authMiddleware, requireRole(['HOST']), categoryController.createCategory);
router.put('/:id', authMiddleware, requireRole(['HOST']), categoryController.updateCategory);
router.delete('/:id', authMiddleware, requireRole(['HOST']), categoryController.deleteCategory);

export default router;