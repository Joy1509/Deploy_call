"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRouter = void 0;
const express_1 = require("express");
const carryInServiceController_1 = require("../controllers/carryInServiceController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authMiddleware_1.authenticateToken);
// GET /carry-in-services - Get all carry-in services
router.get('/', carryInServiceController_1.getCarryInServices);
// POST /carry-in-services - Create new carry-in service
router.post('/', carryInServiceController_1.createCarryInService);
// POST /carry-in-services/:id/complete - Mark service as completed
router.post('/:id/complete', carryInServiceController_1.completeCarryInService);
// POST /carry-in-services/:id/deliver - Mark service as delivered
router.post('/:id/deliver', carryInServiceController_1.deliverCarryInService);
// GET /carry-in-customers/phone/:phone - Get customer by phone
router.get('/customers/phone/:phone', carryInServiceController_1.getCustomerByPhone);
// Also mount the customer route at the expected path
const customerRouter = (0, express_1.Router)();
exports.customerRouter = customerRouter;
customerRouter.use(authMiddleware_1.authenticateToken);
customerRouter.get('/phone/:phone', carryInServiceController_1.getCustomerByPhone);
exports.default = router;
//# sourceMappingURL=carryInServiceRoutes.js.map