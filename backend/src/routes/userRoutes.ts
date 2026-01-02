import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/', authMiddleware, requireRole(['HOST', 'ADMIN']), userController.getUsers);
router.post('/', authMiddleware, requireRole(['HOST']), userController.createUser);
router.put('/:id', authMiddleware, requireRole(['HOST']), userController.updateUser);
router.delete('/:id', authMiddleware, requireRole(['HOST']), userController.deleteUser);

export default router;