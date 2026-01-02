"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const legacyRoutes_1 = __importDefault(require("./routes/legacyRoutes"));
const socket_1 = __importDefault(require("./config/socket"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const rateLimitMiddleware_1 = require("./middleware/rateLimitMiddleware");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    'https://call-manage.netlify.app',
    'https://deploy-call.netlify.app',
    'https://deploycall.netlify.app'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin)
            return callback(null, true);
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        // Allow localhost in development
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
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Apply rate limiting to all routes
app.use(rateLimitMiddleware_1.RateLimitMiddleware.apiLimiter);
// Initialize Socket.IO
const io = socket_1.default.initialize(app);
exports.io = io;
// Mount API routes
app.use(routes_1.default);
// Legacy routes for backward compatibility (will be deprecated)
// These routes maintain the old API structure so existing frontend continues to work
app.use(legacyRoutes_1.default);
// Add deprecation warning middleware for legacy routes
app.use((req, res, next) => {
    if (!req.path.startsWith('/api/v1')) {
        res.setHeader('X-API-Deprecated', 'true');
        res.setHeader('X-API-Migration', 'Please migrate to /api/v1/ endpoints');
    }
    next();
});
// 404 handler
app.use('*', errorMiddleware_1.ErrorMiddleware.notFound);
// Global error handler (must be last)
app.use(errorMiddleware_1.ErrorMiddleware.handle);
exports.default = app;
//# sourceMappingURL=app.js.map