import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as carryInServiceController from '../controllers/carryInServiceController';
import * as customerController from '../controllers/customerController';

const router = Router();

router.get('/', authMiddleware, carryInServiceController.getCarryInServices);
router.post('/', authMiddleware, carryInServiceController.createCarryInService);
router.post('/:id/complete', authMiddleware, carryInServiceController.completeCarryInService);
router.post('/:id/deliver', authMiddleware, carryInServiceController.deliverCarryInService);

// Carry-in customer routes
router.get('/customers/phone/:phone', authMiddleware, customerController.getCustomerByPhone);

export default router;