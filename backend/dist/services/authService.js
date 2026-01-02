"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
const jwt_1 = require("../utils/jwt");
const emailService_1 = require("./emailService");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const passwordValidator_1 = require("../utils/passwordValidator");
const errors_1 = require("../utils/errors");
const constants_1 = require("../utils/constants");
// In-memory OTP cache
const otpCache = new Map();
class AuthService {
    static async login(loginData) {
        const { username, password } = loginData;
        // Check if account is locked
        const accountStatus = rateLimitMiddleware_1.RateLimitMiddleware.getAccountStatus(username);
        if (accountStatus.locked) {
            throw new errors_1.AuthenticationError(`Account locked. Try again in ${accountStatus.remainingTime} minutes.`);
        }
        const user = await database_1.prisma.user.findUnique({ where: { username } });
        if (!user) {
            rateLimitMiddleware_1.RateLimitMiddleware.recordFailedLogin(username);
            throw new errors_1.AuthenticationError('Invalid credentials');
        }
        let isValidPassword = false;
        try {
            isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        }
        catch (error) {
            console.error('Password comparison error:', error);
        }
        // Fallback for plain text passwords (legacy support)
        if (!isValidPassword && user.password === password) {
            isValidPassword = true;
        }
        if (!isValidPassword) {
            rateLimitMiddleware_1.RateLimitMiddleware.recordFailedLogin(username);
            // Send lockout email if account gets locked
            const newStatus = rateLimitMiddleware_1.RateLimitMiddleware.getAccountStatus(username);
            if (newStatus.locked && user.email) {
                await emailService_1.EmailService.sendAccountLockoutEmail(user.email, username, newStatus.remainingTime || 30);
            }
            throw new errors_1.AuthenticationError('Invalid credentials');
        }
        // Clear failed login attempts on successful login
        rateLimitMiddleware_1.RateLimitMiddleware.clearFailedLogin(username);
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role
        };
        const token = jwt_1.JWTUtils.signToken(payload);
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
    static async getMe(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true, phone: true, role: true, createdAt: true }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return user;
    }
    static async verifySecret(userId, secretPassword) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { secretPassword: true, role: true }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.secretPassword !== secretPassword) {
            throw new errors_1.AuthenticationError('Invalid secret password');
        }
        return {
            success: true,
            hasAccess: user.role === 'HOST'
        };
    }
    static async forgotPassword(userId, email) {
        try {
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, role: true, username: true }
            });
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            if (user.email !== email) {
                throw new errors_1.ValidationError(`Email does not match your account. Your registered email is: ${user.email}`);
            }
            if (user.role !== 'HOST') {
                throw new errors_1.AuthenticationError('Only HOST users can reset secret password');
            }
            const otp = emailService_1.EmailService.generateOTP();
            const token = crypto_1.default.randomBytes(32).toString('hex');
            const expiresAt = Date.now() + constants_1.SECURITY.OTP_EXPIRY;
            console.log('Generated OTP:', otp, 'for email:', email);
            otpCache.set(token, {
                email,
                otp,
                expiresAt,
                used: false
            });
            console.log('Attempting to send email to:', email);
            const emailSent = await emailService_1.EmailService.sendOTPEmail(email, otp);
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
        }
        catch (error) {
            console.error('ForgotPassword error:', error);
            throw error;
        }
    }
    static async verifyOTP(userId, email, otp, token) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });
        if (!user || user.email !== email) {
            throw new errors_1.ValidationError('Invalid email');
        }
        const otpData = otpCache.get(token);
        if (!otpData) {
            throw new errors_1.ValidationError('Invalid or expired OTP token');
        }
        if (otpData.expiresAt < Date.now()) {
            otpCache.delete(token);
            throw new errors_1.ValidationError('OTP has expired');
        }
        if (otpData.used) {
            throw new errors_1.ValidationError('OTP already used');
        }
        if (otpData.email !== email || otpData.otp !== otp) {
            throw new errors_1.ValidationError('Invalid OTP code');
        }
        return {
            success: true,
            message: 'OTP verified successfully'
        };
    }
    static async resetPassword(userId, email, otp, token, newPassword) {
        // Validate password strength
        const passwordValidation = passwordValidator_1.PasswordValidator.validate(newPassword);
        if (!passwordValidation.isValid) {
            throw new errors_1.ValidationError(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, role: true }
        });
        if (!user || user.email !== email) {
            throw new errors_1.ValidationError('Invalid email');
        }
        if (user.role !== 'HOST') {
            throw new errors_1.AuthenticationError('Only HOST users can reset secret password');
        }
        const otpData = otpCache.get(token);
        if (!otpData) {
            throw new errors_1.ValidationError('Invalid or expired OTP token');
        }
        if (otpData.expiresAt < Date.now()) {
            otpCache.delete(token);
            throw new errors_1.ValidationError('OTP has expired');
        }
        if (otpData.used) {
            throw new errors_1.ValidationError('OTP already used');
        }
        if (otpData.email !== email || otpData.otp !== otp) {
            throw new errors_1.ValidationError('Invalid OTP');
        }
        await database_1.prisma.user.update({
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
    static async validatePassword(password) {
        return passwordValidator_1.PasswordValidator.validate(password);
    }
    // Cleanup expired OTPs
    static cleanupExpiredOTPs() {
        const now = Date.now();
        for (const [key, data] of otpCache.entries()) {
            if (data.expiresAt < now) {
                otpCache.delete(key);
            }
        }
    }
}
exports.AuthService = AuthService;
// Clean expired OTPs every minute
setInterval(() => {
    AuthService.cleanupExpiredOTPs();
}, 60 * 1000);
//# sourceMappingURL=authService.js.map