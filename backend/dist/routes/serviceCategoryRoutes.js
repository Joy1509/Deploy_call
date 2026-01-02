"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceCategoryController_1 = require("../controllers/serviceCategoryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authMiddleware_1.authenticateToken);
// GET /service-categories - Get all service categories
router.get('/', serviceCategoryController_1.getServiceCategories);
// POST /service-categories - Create new service category (admin only)
router.post('/', (0, roleMiddleware_1.requireRole)(['admin']), serviceCategoryController_1.createServiceCategory);
// PUT /service-categories/:id - Update service category (admin only)
router.put('/:id', (0, roleMiddleware_1.requireRole)(['admin']), serviceCategoryController_1.updateServiceCategory);
// DELETE /service-categories/:id - Delete service category (admin only)
router.delete('/:id', (0, roleMiddleware_1.requireRole)(['admin']), serviceCategoryController_1.deleteServiceCategory);
exports.default = router;
//# sourceMappingURL=serviceCategoryRoutes.js.map