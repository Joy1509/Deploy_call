import { z } from 'zod';
export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required')
});
export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address')
});
export const verifyOTPSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
    token: z.string().min(1, 'Token is required')
});
export const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/\d/, 'Password must contain at least one number')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
});
export const verifySecretSchema = z.object({
    secretPassword: z.string().min(1, 'Secret password is required')
});
//# sourceMappingURL=authSchemas.js.map