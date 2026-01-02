import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors';

export class ValidationMiddleware {
  public static validateBody(schema: z.ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const validatedData = schema.parse(req.body);
        req.body = validatedData;
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessages = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
          throw new ValidationError(`Validation failed: ${errorMessages.join(', ')}`);
        }
        next(error);
      }
    };
  }

  public static validateQuery(schema: z.ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const validatedData = schema.parse(req.query);
        req.query = validatedData as any;
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessages = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
          throw new ValidationError(`Query validation failed: ${errorMessages.join(', ')}`);
        }
        next(error);
      }
    };
  }

  public static validateParams(schema: z.ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const validatedData = schema.parse(req.params);
        req.params = validatedData as any;
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessages = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
          throw new ValidationError(`Parameter validation failed: ${errorMessages.join(', ')}`);
        }
        next(error);
      }
    };
  }
}