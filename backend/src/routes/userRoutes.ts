import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { AuthMiddleware } from '../middleware/authMiddleware';
import { RoleMiddleware } from '../middleware/roleMiddleware';
import { ValidationMiddleware } from '../middleware/validationMiddleware';
import { createUserSchema, updateUserSchema } from '../utils/validation';

const router = Router();

// All user routes require authentication
router.use(AuthMiddleware.authenticate);

// Get all users (HOST and ADMIN only)
router.get('/', 
  RoleMiddleware.requireHostOrAdmin(),
  UserController.getAllUsers
);

// Create user (HOST only)
router.post('/', 
  RoleMiddleware.requireHost(),
  ValidationMiddleware.validateBody(createUserSchema),
  UserController.createUser
);

// Update user (HOST only)
router.put('/:id', 
  RoleMiddleware.requireHost(),
  ValidationMiddleware.validateBody(updateUserSchema),
  UserController.updateUser
);

// Delete user (HOST only)
router.delete('/:id', 
  RoleMiddleware.requireHost(),
  UserController.deleteUser
);

export default router;