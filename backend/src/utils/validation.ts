import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  token: z.string().min(1, 'Token is required')
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
});

// User validation schemas
export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  role: z.enum(['HOST', 'ADMIN', 'ENGINEER']),
  secretPassword: z.string().optional()
});

export const updateUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional(),
  role: z.enum(['HOST', 'ADMIN', 'ENGINEER']).optional(),
  secretPassword: z.string().optional()
});

// Call validation schemas
export const createCallSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().optional(),
  problem: z.string().min(1, 'Problem description is required'),
  category: z.string().min(1, 'Category is required'),
  assignedTo: z.string().optional(),
  engineerRemark: z.string().optional(),
  createdBy: z.string().optional()
});

export const updateCallSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().optional(),
  problem: z.string().min(1, 'Problem description is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.string().optional(),
  assignedTo: z.string().optional()
});

// Category validation schemas
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').trim()
});

// Carry-in service validation schemas
export const createCarryInServiceSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  serviceDescription: z.string().optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateCallInput = z.infer<typeof createCallSchema>;
export type UpdateCallInput = z.infer<typeof updateCallSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CreateCarryInServiceInput = z.infer<typeof createCarryInServiceSchema>;