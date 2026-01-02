// Load environment variables first
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { createServer } from 'http';
import { app, io } from './app';
import DatabaseConfig from './config/database';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Create HTTP server
const httpServer = createServer(app);

// Attach Socket.IO to the HTTP server
io.attach(httpServer);

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  
  try {
    // Close HTTP server first
    await new Promise<void>((resolve) => {
      httpServer.close(() => {
        console.log('HTTP server closed');
        resolve();
      });
    });
    
    // Disconnect from database
    await DatabaseConfig.disconnect();
    
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Start server
async function startServer() {
  try {
    // Validate environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    // Connect to database
    await DatabaseConfig.connect();
    
    // Start HTTP server
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API v1: http://localhost:${PORT}/api/v1`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/v1/health`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log(`🌐 Production URL: https://deploy-call-1.onrender.com/api/v1/health`);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();