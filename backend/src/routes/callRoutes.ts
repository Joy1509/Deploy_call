import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import * as callController from '../controllers/callController';

const router = Router();

router.get('/', authMiddleware, callController.getCalls);
router.post('/', authMiddleware, callController.createCall);
router.put('/:id', authMiddleware, requireRole(['HOST', 'ADMIN']), callController.updateCall);
router.post('/:id/assign', authMiddleware, requireRole(['HOST', 'ADMIN']), callController.assignCall);
router.post('/:id/complete', authMiddleware, callController.completeCall);
router.post('/check-duplicate', authMiddleware, callController.checkDuplicateCall);
router.put('/:id/increment', authMiddleware, callController.incrementCallCount);

export default router;