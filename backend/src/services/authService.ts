import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { JWTUtils, type JWTPayload } from '../utils/jwt';
import { EmailService } from './emailService';
import { RateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import { PasswordValidator } from '../utils/passwordValidator';
import { AuthenticationError, NotFoundError, ValidationError } from '../utils/errors';
import { SECURITY } from '../utils/constants';
import type { LoginInput } from '../utils/validation';

// In-memory OTP cache
const otpCache = new Map<string, {
  email: string;
  otp: string;
  expiresAt: number;
  used: boolean;
}>();

export class AuthService {
  public static async login(loginData: LoginInput): Promise<{ token: string; user: any }> {
    const { username, password } = loginData;

    // Check if account is locked
    const accountStatus = RateLimitMiddleware.getAccountStatus(username);
    if (accountStatus.locked) {
      throw new AuthenticationError(`Account locked. Try again in ${accountStatus.remainingTime} minutes.`);
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      RateLimitMiddleware.recordFailedLogin(username);
      throw new AuthenticationError('Invalid credentials');
    }

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Password comparison error:', error);
    }

    // Fallback for plain text passwords (legacy support)
    if (!isValidPassword && user.password === password) {
      isValidPassword = true;
    }

    if (!isValidPassword) {
      RateLimitMiddleware.recordFailedLogin(username);
      
      // Send lockout email if account gets locked
      const newStatus = RateLimitMiddleware.getAccountStatus(username);
      if (newStatus.locked && user.email) {
        await EmailService.sendAccountLockoutEmail(user.email, username, newStatus.remainingTime || 30);
      }
      
      throw new AuthenticationError('Invalid credentials');
    }

    // Clear failed login attempts on successful login
    RateLimitMiddleware.clearFailedLogin(username);

    const payload: JWTPayload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const token = JWTUtils.signToken(payload);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  }

  public static async getMe(userId: number): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, phone: true, role: true, createdAt: true }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  public static async verifySecret(userId: number, secretPassword: string): Promise<{ success: boolean; hasAccess: boolean }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { secretPassword: true, role: true }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.secretPassword !== secretPassword) {
      throw new AuthenticationError('Invalid secret password');
    }

    return {
      success: true,
      hasAccess: user.role === 'HOST'
    };
  }

  public static async forgotPassword(userId: number, email: string): Promise<{ success: boolean; token: string; message: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, role: true, username: true }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.email !== email) {
        throw new ValidationError(`Email does not match your account. Your registered email is: ${user.email}`);
      }

      if (user.role !== 'HOST') {
        throw new AuthenticationError('Only HOST users can reset secret password');
      }

      const otp = EmailService.generateOTP();
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + SECURITY.OTP_EXPIRY;

      console.log('Generated OTP:', otp, 'for email:', email);

      otpCache.set(token, {
        email,
        otp,
        expiresAt,
        used: false
      });

      console.log('Attempting to send email to:', email);
      const emailSent = await EmailService.sendOTPEmail(email, otp);
      console.log('Email sent result:', emailSent);
      
      if (!emailSent) {
        otpCache.delete(token);
        throw new Error('Failed to send OTP email. Please check your email configuration.');
      }

      return {
        success: true,
        token,
        message: 'OTP sent to your email address'
      };
    } catch (error) {
      console.error('ForgotPassword error:', error);
      throw error;
    }
  }

  public static async verifyOTP(userId: number, email: string, otp: string, token: string): Promise<{ success: boolean; message: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user || user.email !== email) {
      throw new ValidationError('Invalid email');
    }

    const otpData = otpCache.get(token);
    if (!otpData) {
      throw new ValidationError('Invalid or expired OTP token');
    }

    if (otpData.expiresAt < Date.now()) {
      otpCache.delete(token);
      throw new ValidationError('OTP has expired');
    }

    if (otpData.used) {
      throw new ValidationError('OTP already used');
    }

    if (otpData.email !== email || otpData.otp !== otp) {
      throw new ValidationError('Invalid OTP code');
    }

    return {
      success: true,
      message: 'OTP verified successfully'
    };
  }

  public static async resetPassword(userId: number, email: string, otp: string, token: string, newPassword: string): Promise<{ success: boolean; message: string; passwordStrength?: string }> {
    // Validate password strength
    const passwordValidation = PasswordValidator.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true }
    });

    if (!user || user.email !== email) {
      throw new ValidationError('Invalid email');
    }

    if (user.role !== 'HOST') {
      throw new AuthenticationError('Only HOST users can reset secret password');
    }

    const otpData = otpCache.get(token);
    if (!otpData) {
      throw new ValidationError('Invalid or expired OTP token');
    }

    if (otpData.expiresAt < Date.now()) {
      otpCache.delete(token);
      throw new ValidationError('OTP has expired');
    }

    if (otpData.used) {
      throw new ValidationError('OTP already used');
    }

    if (otpData.email !== email || otpData.otp !== otp) {
      throw new ValidationError('Invalid OTP');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { secretPassword: newPassword }
    });

    otpCache.delete(token);

    return {
      success: true,
      message: 'Secret password reset successfully',
      passwordStrength: passwordValidation.strength
    };
  }

  public static async validatePassword(password: string) {
    return PasswordValidator.validate(password);
  }

  // Cleanup expired OTPs
  public static cleanupExpiredOTPs(): void {
    const now = Date.now();
    for (const [key, data] of otpCache.entries()) {
      if (data.expiresAt < now) {
        otpCache.delete(key);
      }
    }
  }
}

// Clean expired OTPs every minute
setInterval(() => {
  AuthService.cleanupExpiredOTPs();
}, 60 * 1000);