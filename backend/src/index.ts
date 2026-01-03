import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { initializeDatabase, disconnectDatabase } from './config/database';
import { initializeSocket } from './services/socketService';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    'https://call-manage.netlify.app',
    'https://deploy-call.netlify.app',
    'https://deploycall.netlify.app'
];

app.use(express.json());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) return callback(null, true);
        
        if (process.env.NODE_ENV !== 'production' && 
            (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
            return callback(null, true);
        }
        
        console.warn(`CORS blocked origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Initialize WebSocket
initializeSocket(httpServer);

// Health check endpoint
app.get("/api/v1/health", async (req, res) => {
    try {
        const { prisma } = await import('./config/database');
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: "ok", message: "Server and database are running" });
    } catch (err: any) {
        console.error('Health check failed:', err);
        res.status(500).json({ status: "error", error: 'Database connection failed', details: err.message });
    }
});

// API routes
app.use('/api', routes);

// Error handling
app.use('*', notFoundHandler);
app.use(errorHandler);

// Helper function to clean up old notifications
const cleanupOldNotifications = async () => {
    try {
        const { prisma } = await import('./config/database');
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const result = await prisma.notification.deleteMany({
            where: {
                createdAt: { lt: twentyFourHoursAgo }
            }
        });
        if (result.count > 0) {
            console.log(`Cleaned up ${result.count} old notifications`);
        }
    } catch (error) {
        console.error('Failed to cleanup old notifications:', error);
    }
};

// Run cleanup every hour
setInterval(cleanupOldNotifications, 60 * 60 * 1000);

// Start server
async function startServer() {
    try {
        await initializeDatabase();
        
        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    try {
        await disconnectDatabase();
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

process.on("SIGTERM", async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    try {
        await disconnectDatabase();
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});