import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { createUserSchema, updateUserSchema } from '../../schemas/userSchemas';
import * as userController from '../../controllers/userController';
const router = Router();
router.get('/', authMiddleware, requireRole(['HOST', 'ADMIN']), userController.getUsers);
router.post('/', authMiddleware, requireRole(['HOST']), validate(createUserSchema), userController.createUser);
router.put('/:id', authMiddleware, requireRole(['HOST']), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authMiddleware, requireRole(['HOST']), userController.deleteUser);
export default router;
//# sourceMappingURL=userRoutes.js.map