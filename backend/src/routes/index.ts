import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import categoryRoutes from './categoryRoutes';
import serviceCategoryRoutes from './serviceCategoryRoutes';
import carryInServiceRoutes, { customerRouter } from './carryInServiceRoutes';
import notificationRoutes from './notificationRoutes';
import analyticsRoutes from './analyticsRoutes';
import legacyRoutes from './legacyRoutes';
import { API_ROUTES } from '../utils/constants';
import DatabaseConfig from '../config/database';

const router = Router();

// API v1 routes
const v1Router = Router();

// Mount route modules
v1Router.use('/auth', authRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/categories', categoryRoutes);
v1Router.use('/service-categories', serviceCategoryRoutes);
v1Router.use('/carry-in-services', carryInServiceRoutes);
v1Router.use('/carry-in-customers', customerRouter);
v1Router.use('/customers', customerRouter);
v1Router.use('/notifications', notificationRoutes);
v1Router.use('/analytics', analyticsRoutes);

// Legacy routes (for backward compatibility)
v1Router.use('/', legacyRoutes);

// Health check endpoint with database status
v1Router.get('/health', async (req, res) => {
  try {
    const dbHealthy = await DatabaseConfig.healthCheck();
    
    res.json({ 
      status: dbHealthy ? 'ok' : 'degraded', 
      message: 'API v1 is running',
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      database: 'error',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
});

// Mount v1 routes
router.use(API_ROUTES.V1, v1Router);

export default router;