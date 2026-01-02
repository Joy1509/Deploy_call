"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCarryInServiceSchema = exports.categorySchema = exports.updateCallSchema = exports.createCallSchema = exports.updateUserSchema = exports.createUserSchema = exports.resetPasswordSchema = exports.verifyOtpSchema = exports.forgotPasswordSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Auth validation schemas
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format')
});
exports.verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
    token: zod_1.z.string().min(1, 'Token is required')
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
    token: zod_1.z.string().min(1, 'Token is required'),
    newPassword: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
});
// User validation schemas
exports.createUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, 'Username must be at least 3 characters'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    email: zod_1.z.string().email('Invalid email format'),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 digits'),
    role: zod_1.z.enum(['HOST', 'ADMIN', 'ENGINEER']),
    secretPassword: zod_1.z.string().optional()
});
exports.updateUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, 'Username must be at least 3 characters').optional(),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
        .optional(),
    email: zod_1.z.string().email('Invalid email format').optional(),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 digits').optional(),
    role: zod_1.z.enum(['HOST', 'ADMIN', 'ENGINEER']).optional(),
    secretPassword: zod_1.z.string().optional()
});
// Call validation schemas
exports.createCallSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(1, 'Customer name is required'),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 digits'),
    email: zod_1.z.string().email('Invalid email format').optional(),
    address: zod_1.z.string().optional(),
    problem: zod_1.z.string().min(1, 'Problem description is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    assignedTo: zod_1.z.string().optional(),
    engineerRemark: zod_1.z.string().optional(),
    createdBy: zod_1.z.string().optional()
});
exports.updateCallSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(1, 'Customer name is required'),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 digits'),
    email: zod_1.z.string().email('Invalid email format').optional(),
    address: zod_1.z.string().optional(),
    problem: zod_1.z.string().min(1, 'Problem description is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    status: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().optional()
});
// Category validation schemas
exports.categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required').trim()
});
// Carry-in service validation schemas
exports.createCarryInServiceSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(1, 'Customer name is required'),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 digits'),
    email: zod_1.z.string().email('Invalid email format').optional(),
    address: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1, 'Category is required'),
    serviceDescription: zod_1.z.string().optional()
});
//# sourceMappingURL=validation.js.map