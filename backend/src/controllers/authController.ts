import type { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ErrorMiddleware } from '../middleware/errorMiddleware';

export class AuthController {
  public static login = ErrorMiddleware.asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    res.json(result);
  });

  public static getMe = ErrorMiddleware.asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const user = await AuthService.getMe(req.user.id);
    res.json(user);
  });

  public static verifySecret = ErrorMiddleware.asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { secretPassword } = req.body;
    const result = await AuthService.verifySecret(req.user.id, secretPassword);
    res.json(result);
  });

  public static forgotPassword = ErrorMiddleware.asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { email } = req.body;
    const result = await AuthService.forgotPassword(req.user.id, email);
    res.json(result);
  });

  public static verifyOTP = ErrorMiddleware.asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { email, otp, token } = req.body;
    const result = await AuthService.verifyOTP(req.user.id, email, otp, token);
    res.json(result);
  });

  public static resetPassword = ErrorMiddleware.asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { email, otp, token, newPassword } = req.body;
    const result = await AuthService.resetPassword(req.user.id, email, otp, token, newPassword);
    res.json(result);
  });

  public static validatePassword = ErrorMiddleware.asyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    const validation = await AuthService.validatePassword(password);
    res.json(validation);
  });
}