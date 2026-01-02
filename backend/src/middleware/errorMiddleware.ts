import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export class ErrorMiddleware {
  public static handle(err: Error, req: Request, res: Response, next: NextFunction): void {
    console.error('Error occurred:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      user: req.user?.username || 'anonymous'
    });

    // Handle known application errors
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        error: err.message,
        status: err.statusCode
      });
      return;
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
      const prismaError = err as any;
      
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

    // Handle Prisma connection errors
    if (err.name === 'PrismaClientInitializationError' || 
        err.name === 'PrismaClientRustPanicError' ||
        err.message.includes('Can\'t reach database server')) {
      console.error('Database connection error:', err.message);
      res.status(503).json({
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
      return;
    }

    // Handle validation errors from other sources
    if (err.name === 'ValidationError') {
      res.status(400).json({
        error: 'Validation failed',
        details: err.message
      });
      return;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token'
      });
      return;
    }

    // Handle unexpected errors
    if (process.env.NODE_ENV === 'production') {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong. Please try again later.'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        stack: err.stack
      });
    }
  }

  public static notFound(req: Request, res: Response): void {
    res.status(404).json({
      error: 'Route not found',
      message: `Cannot ${req.method} ${req.path}`
    });
  }

  public static asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}