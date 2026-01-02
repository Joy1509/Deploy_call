"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
// All user routes require authentication
router.use(authMiddleware_1.AuthMiddleware.authenticate);
// Get all users (HOST and ADMIN only)
router.get('/', roleMiddleware_1.RoleMiddleware.requireHostOrAdmin(), userController_1.UserController.getAllUsers);
// Create user (HOST only)
router.post('/', roleMiddleware_1.RoleMiddleware.requireHost(), validationMiddleware_1.ValidationMiddleware.validateBody(validation_1.createUserSchema), userController_1.UserController.createUser);
// Update user (HOST only)
router.put('/:id', roleMiddleware_1.RoleMiddleware.requireHost(), validationMiddleware_1.ValidationMiddleware.validateBody(validation_1.updateUserSchema), userController_1.UserController.updateUser);
// Delete user (HOST only)
router.delete('/:id', roleMiddleware_1.RoleMiddleware.requireHost(), userController_1.UserController.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map