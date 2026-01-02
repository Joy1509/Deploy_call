import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import legacyRoutes from './routes/legacyRoutes';
import SocketConfig from './config/socket';
import { ErrorMiddleware } from './middleware/errorMiddleware';
import { RateLimitMiddleware } from './middleware/rateLimitMiddleware';
import { DatabaseMiddleware } from './middleware/databaseMiddleware';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration - simplified for development
const corsOptions = {
  origin: true, // Allow all origins in development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware for CORS issues
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin') || 'none'}`);
  next();
});

// Apply rate limiting to all routes
app.use(RateLimitMiddleware.apiLimiter);

// Apply database connection check to all routes
app.use(DatabaseMiddleware.checkConnection);

// Initialize Socket.IO
const io = SocketConfig.initialize(app);

// Mount API routes
app.use(routes);

// Legacy routes for backward compatibility (will be deprecated)
// These routes maintain the old API structure so existing frontend continues to work
app.use(legacyRoutes);

// Add deprecation warning middleware for legacy routes
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/v1')) {
    res.setHeader('X-API-Deprecated', 'true');
    res.setHeader('X-API-Migration', 'Please migrate to /api/v1/ endpoints');
  }
  next();
})

// 404 handler
app.use('*', ErrorMiddleware.notFound);

// Global error handler (must be last)
app.use(ErrorMiddleware.handle);

export { app, io };
export default app;