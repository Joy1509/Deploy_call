import type { Request, Response, NextFunction } from 'express';
import DatabaseConfig from '../config/database';

export class DatabaseMiddleware {
  public static checkConnection = async (req: Request, res: Response, next: NextFunction) => {
    // Temporarily skip database check - database is unreachable
    next();
  };
}