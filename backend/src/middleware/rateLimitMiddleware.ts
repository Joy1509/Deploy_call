import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';
import { RATE_LIMIT, SECURITY } from '../utils/constants';
import { RateLimitError, AccountLockedError } from '../utils/errors';

// In-memory store for failed login attempts and account lockouts
const loginAttempts = new Map<string, { count: number; lastAttempt: number; locked?: boolean; lockUntil?: number }>();

export class RateLimitMiddleware {
  // General API rate limiting
  public static apiLimiter = rateLimit({
    windowMs: RATE_LIMIT.API_WINDOW,
    max: RATE_LIMIT.API_REQUESTS,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(RATE_LIMIT.API_WINDOW / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      throw new RateLimitError('Too many requests from this IP, please try again later.');
    }
  });

  // Strict login rate limiting
  public static loginLimiter = rateLimit({
    windowMs: RATE_LIMIT.LOGIN_WINDOW,
    max: RATE_LIMIT.LOGIN_ATTEMPTS,
    message: {
      error: 'Too many login attempts from this IP, please try again later.',
      retryAfter: Math.ceil(RATE_LIMIT.LOGIN_WINDOW / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      throw new RateLimitError('Too many login attempts from this IP, please try again later.');
    }
  });

  // Account lockout middleware
  public static checkAccountLockout(req: Request, res: Response, next: NextFunction): void {
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
      throw new AccountLockedError(`Account locked due to too many failed attempts. Try again in ${remainingTime} minutes.`);
    }

    // Reset lock if time has passed
    if (attempts.locked && attempts.lockUntil && Date.now() >= attempts.lockUntil) {
      loginAttempts.delete(username);
    }

    next();
  }

  // Record failed login attempt
  public static recordFailedLogin(username: string): void {
    const now = Date.now();
    const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: now };

    // Reset count if last attempt was more than lockout duration ago
    if (now - attempts.lastAttempt > SECURITY.ACCOUNT_LOCKOUT_DURATION) {
      attempts.count = 0;
    }

    attempts.count++;
    attempts.lastAttempt = now;

    // Lock account if too many attempts
    if (attempts.count >= SECURITY.ACCOUNT_LOCKOUT_ATTEMPTS) {
      attempts.locked = true;
      attempts.lockUntil = now + SECURITY.ACCOUNT_LOCKOUT_DURATION;
    }

    loginAttempts.set(username, attempts);
  }

  // Clear failed login attempts on successful login
  public static clearFailedLogin(username: string): void {
    loginAttempts.delete(username);
  }

  // Get account status
  public static getAccountStatus(username: string): { locked: boolean; remainingTime?: number } {
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
  public static cleanup(): void {
    const now = Date.now();
    for (const [username, attempts] of loginAttempts.entries()) {
      if (now - attempts.lastAttempt > SECURITY.ACCOUNT_LOCKOUT_DURATION * 2) {
        loginAttempts.delete(username);
      }
    }
  }
}

// Cleanup old entries every hour
setInterval(() => {
  RateLimitMiddleware.cleanup();
}, 60 * 60 * 1000);