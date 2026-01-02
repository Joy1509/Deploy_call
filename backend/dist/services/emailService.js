"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
class EmailService {
    static generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    static async sendOTPEmail(email, otp) {
        try {
            console.log('Email config check:', {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS ? '***SET***' : 'NOT SET'
            });
            // Create transporter each time to ensure fresh env vars
            const transporter = nodemailer_1.default.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT || '587'),
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            console.log('Sending OTP email to:', email);
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'CallFlow - Password Reset OTP',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">CallFlow Secret Password Reset</h2>
            <p>You have requested to reset your secret password for accessing User Management. Please use the following OTP to proceed:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this secret password reset, please ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">CallFlow Call Management System</p>
          </div>
        `
            };
            const result = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return true;
        }
        catch (error) {
            console.error('Failed to send OTP email:', error);
            return false;
        }
    }
    static async sendAccountLockoutEmail(email, username, lockDuration) {
        try {
            const transporter = nodemailer_1.default.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT || '587'),
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'CallFlow - Account Locked',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">CallFlow Account Locked</h2>
            <p>Your account <strong>${username}</strong> has been temporarily locked due to multiple failed login attempts.</p>
            <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <p style="margin: 0;"><strong>Lockout Duration:</strong> ${lockDuration} minutes</p>
              <p style="margin: 10px 0 0 0;"><strong>Reason:</strong> Too many failed login attempts</p>
            </div>
            <p>If this wasn't you, please contact your administrator immediately.</p>
            <p>Your account will be automatically unlocked after the lockout period expires.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">CallFlow Call Management System</p>
          </div>
        `
            };
            await transporter.sendMail(mailOptions);
            return true;
        }
        catch (error) {
            console.error('Failed to send account lockout email:', error);
            return false;
        }
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=emailService.js.map