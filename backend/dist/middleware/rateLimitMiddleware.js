"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const constants_1 = require("../utils/constants");
const errors_1 = require("../utils/errors");
// In-memory store for failed login attempts and account lockouts
const loginAttempts = new Map();
class RateLimitMiddleware {
    // Account lockout middleware
    static checkAccountLockout(req, res, next) {
        const { username } = req.body;
        if (!username) {
            return next();
        }
        const attempts = loginAttempts.get(username);
        if (!attempts) {
            return next();
        }
        // Check if account is locked
        if (attempts.locked && attempts.lockUntil && Date.now() < attempts.lockUntil) {
            const remainingTime = Math.ceil((attempts.lockUntil - Date.now()) / 1000 / 60);
            throw new errors_1.AccountLockedError(`Account locked due to too many failed attempts. Try again in ${remainingTime} minutes.`);
        }
        // Reset lock if time has passed
        if (attempts.locked && attempts.lockUntil && Date.now() >= attempts.lockUntil) {
            loginAttempts.delete(username);
        }
        next();
    }
    // Record failed login attempt
    static recordFailedLogin(username) {
        const now = Date.now();
        const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: now };
        // Reset count if last attempt was more than lockout duration ago
        if (now - attempts.lastAttempt > constants_1.SECURITY.ACCOUNT_LOCKOUT_DURATION) {
            attempts.count = 0;
        }
        attempts.count++;
        attempts.lastAttempt = now;
        // Lock account if too many attempts
        if (attempts.count >= constants_1.SECURITY.ACCOUNT_LOCKOUT_ATTEMPTS) {
            attempts.locked = true;
            attempts.lockUntil = now + constants_1.SECURITY.ACCOUNT_LOCKOUT_DURATION;
        }
        loginAttempts.set(username, attempts);
    }
    // Clear failed login attempts on successful login
    static clearFailedLogin(username) {
        loginAttempts.delete(username);
    }
    // Get account status
    static getAccountStatus(username) {
        const attempts = loginAttempts.get(username);
        if (!attempts || !attempts.locked || !attempts.lockUntil) {
            return { locked: false };
        }
        if (Date.now() >= attempts.lockUntil) {
            loginAttempts.delete(username);
            return { locked: false };
        }
        const remainingTime = Math.ceil((attempts.lockUntil - Date.now()) / 1000 / 60);
        return { locked: true, remainingTime };
    }
    // Cleanup old entries (run periodically)
    static cleanup() {
        const now = Date.now();
        for (const [username, attempts] of loginAttempts.entries()) {
            if (now - attempts.lastAttempt > constants_1.SECURITY.ACCOUNT_LOCKOUT_DURATION * 2) {
                loginAttempts.delete(username);
            }
        }
    }
}
exports.RateLimitMiddleware = RateLimitMiddleware;
// General API rate limiting
RateLimitMiddleware.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: constants_1.RATE_LIMIT.API_WINDOW,
    max: constants_1.RATE_LIMIT.API_REQUESTS,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(constants_1.RATE_LIMIT.API_WINDOW / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new errors_1.RateLimitError('Too many requests from this IP, please try again later.');
    }
});
// Strict login rate limiting
RateLimitMiddleware.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: constants_1.RATE_LIMIT.LOGIN_WINDOW,
    max: constants_1.RATE_LIMIT.LOGIN_ATTEMPTS,
    message: {
        error: 'Too many login attempts from this IP, please try again later.',
        retryAfter: Math.ceil(constants_1.RATE_LIMIT.LOGIN_WINDOW / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new errors_1.RateLimitError('Too many login attempts from this IP, please try again later.');
    }
});
// Cleanup old entries every hour
setInterval(() => {
    RateLimitMiddleware.cleanup();
}, 60 * 60 * 1000);
//# sourceMappingURL=rateLimitMiddleware.js.map