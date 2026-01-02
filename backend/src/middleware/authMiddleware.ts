import type { Request, Response, NextFunction } from 'express';
import { JWTUtils, type JWTPayload } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export class AuthMiddleware {
  public static authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
      const auth = req.headers['authorization'] as string | undefined;
      
      if (!auth) {
        throw new AuthenticationError('Missing Authorization header');
      }

      const parts = auth.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new AuthenticationError('Invalid Authorization format');
      }

      const token = parts[1];
      if (!token) {
        throw new AuthenticationError('Missing token');
      }

      const payload = JWTUtils.verifyToken(token);
      if (!payload) {
        throw new AuthenticationError('Invalid token');
      }

      req.user = payload;
      next();
    } catch (error) {
      next(error);
    }
  }
}

// Export the authenticate function directly for easier import
export const authenticateToken = AuthMiddleware.authenticate;