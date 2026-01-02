"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleware = void 0;
const errors_1 = require("../utils/errors");
class ErrorMiddleware {
    static handle(err, req, res, next) {
        console.error('Error occurred:', {
            message: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            body: req.body,
            user: req.user?.username || 'anonymous'
        });
        // Handle known application errors
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({
                error: err.message,
                status: err.statusCode
            });
            return;
        }
        // Handle Prisma errors
        if (err.name === 'PrismaClientKnownRequestError') {
            const prismaError = err;
            if (prismaError.code === 'P2002') {
                res.status(409).json({
                    error: 'Resource already exists',
                    details: 'A record with this information already exists'
                });
                return;
            }
            if (prismaError.code === 'P2025') {
                res.status(404).json({
                    error: 'Resource not found',
                    details: 'The requested resource does not exist'
                });
                return;
            }
        }
        // Handle validation errors from other sources
        if (err.name === 'ValidationError') {
            res.status(400).json({
                error: 'Validation failed',
                details: err.message
            });
            return;
        }
        // Handle unexpected errors
        if (process.env.NODE_ENV === 'production') {
            res.status(500).json({
                error: 'Internal server error',
                message: 'Something went wrong. Please try again later.'
            });
        }
        else {
            res.status(500).json({
                error: 'Internal server error',
                message: err.message,
                stack: err.stack
            });
        }
    }
    static notFound(req, res) {
        res.status(404).json({
            error: 'Route not found',
            message: `Cannot ${req.method} ${req.path}`
        });
    }
    static asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}
exports.ErrorMiddleware = ErrorMiddleware;
//# sourceMappingURL=errorMiddleware.js.map