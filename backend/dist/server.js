"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = require("./app");
const database_1 = __importDefault(require("./config/database"));
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
// Create HTTP server
const httpServer = (0, http_1.createServer)(app_1.app);
// Attach Socket.IO to the HTTP server
app_1.io.attach(httpServer);
// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    try {
        // Close HTTP server
        httpServer.close(() => {
            console.log('HTTP server closed');
        });
        // Disconnect from database
        await database_1.default.disconnect();
        console.log('Graceful shutdown completed');
        process.exit(0);
    }
    catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};
// Start server
async function startServer() {
    try {
        // Connect to database
        await database_1.default.connect();
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
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Handle process signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Start the server
startServer();
//# sourceMappingURL=server.js.map