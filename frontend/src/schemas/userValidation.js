import { z } from 'zod';

// Password validation schema with all requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');

// User creation schema
export const createUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: passwordSchema,
  role: z.enum(['ENGINEER', 'ADMIN', 'HOST']),
  secretPassword: z.string().optional()
});

// User update schema (password optional)
export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: passwordSchema.optional(),
  role: z.enum(['ENGINEER', 'ADMIN', 'HOST']),
  secretPassword: z.string().optional()
});

// Password strength checker
export const checkPasswordStrength = (password) => {
  const requirements = [
    { test: password.length >= 8, label: 'At least 8 characters' },
    { test: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { test: /[a-z]/.test(password), label: 'One lowercase letter' },
    { test: /\d/.test(password), label: 'One number' },
    { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), label: 'One special character' }
  ];
  
  const passedCount = requirements.filter(req => req.test).length;
  const strength = passedCount === 5 ? 'strong' : passedCount >= 3 ? 'medium' : 'weak';
  
  return { requirements, strength, isValid: passedCount === 5 };
};