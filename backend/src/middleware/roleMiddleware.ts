import type { Request, Response, NextFunction } from 'express';
import { AuthorizationError, AuthenticationError } from '../utils/errors';
import { USER_ROLES } from '../utils/constants';

export class RoleMiddleware {
  public static requireRole(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          throw new AuthenticationError('User not authenticated');
        }

        if (!roles.includes(req.user.role)) {
          throw new AuthorizationError(`Access denied. Required roles: ${roles.join(', ')}`);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  public static requireHost() {
    return RoleMiddleware.requireRole([USER_ROLES.HOST]);
  }

  public static requireHostOrAdmin() {
    return RoleMiddleware.requireRole([USER_ROLES.HOST, USER_ROLES.ADMIN]);
  }

  public static requireAnyRole() {
    return RoleMiddleware.requireRole([USER_ROLES.HOST, USER_ROLES.ADMIN, USER_ROLES.ENGINEER]);
  }
}

// Export the requireRole function directly for easier import
export const requireRole = RoleMiddleware.requireRole;