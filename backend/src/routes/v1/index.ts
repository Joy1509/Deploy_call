import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import callRoutes from './callRoutes';
import customerRoutes from './customerRoutes';
import notificationRoutes from './notificationRoutes';
import categoryRoutes from './categoryRoutes';
import serviceCategoryRoutes from './serviceCategoryRoutes';
import carryInServiceRoutes from './carryInServiceRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/calls', callRoutes);
router.use('/customers', customerRoutes);
router.use('/notifications', notificationRoutes);
router.use('/categories', categoryRoutes);
router.use('/service-categories', serviceCategoryRoutes);
router.use('/carry-in-services', carryInServiceRoutes);
router.use('/analytics', analyticsRoutes);

export default router;