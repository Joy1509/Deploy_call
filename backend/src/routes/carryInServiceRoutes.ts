import { Router } from 'express';
import { 
  getCarryInServices, 
  createCarryInService, 
  completeCarryInService, 
  deliverCarryInService,
  getCustomerByPhone,
  getCustomerDirectory
} from '../controllers/carryInServiceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /carry-in-services - Get all carry-in services
router.get('/', getCarryInServices);

// POST /carry-in-services - Create new carry-in service
router.post('/', createCarryInService);

// POST /carry-in-services/:id/complete - Mark service as completed
router.post('/:id/complete', completeCarryInService);

// POST /carry-in-services/:id/deliver - Mark service as delivered
router.post('/:id/deliver', deliverCarryInService);

// GET /carry-in-customers/phone/:phone - Get customer by phone
router.get('/customers/phone/:phone', getCustomerByPhone);

// Also mount the customer route at the expected path
const customerRouter = Router();
customerRouter.use(authenticateToken);
customerRouter.get('/phone/:phone', getCustomerByPhone);
customerRouter.get('/directory', getCustomerDirectory);

export { customerRouter };
export default router;