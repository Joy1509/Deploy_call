import nodemailer from 'nodemailer';
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
export async function sendOTPEmail(email, otp) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
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
        await emailTransporter.sendMail(mailOptions);
        return true;
    }
    catch (error) {
        console.error('Failed to send OTP email:', error);
        return false;
    }
}
//# sourceMappingURL=emailService.js.map