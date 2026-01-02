import type { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ErrorMiddleware } from '../middleware/errorMiddleware';

export class UserController {
  public static getAllUsers = ErrorMiddleware.asyncHandler(async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    res.json(users);
  });

  public static createUser = ErrorMiddleware.asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.createUser(req.body);
    res.status(201).json(user);
  });

  public static updateUser = ErrorMiddleware.asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id!);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await UserService.updateUser(userId, req.body);
    res.json(user);
  });

  public static deleteUser = ErrorMiddleware.asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id!);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    await UserService.deleteUser(userId);
    res.json({ success: true });
  });
}