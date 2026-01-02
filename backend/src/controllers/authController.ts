import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { signToken } from '../utils/jwt';
import { comparePassword } from '../utils/bcrypt';
import { generateOTP, sendOTPEmail } from '../services/emailService';
import crypto from 'crypto';

// In-memory OTP cache
const otpCache = new Map();

// Helper function to clean expired OTPs
function cleanExpiredOTPs() {
  const now = Date.now();
  for (const [key, data] of otpCache.entries()) {
    if (data.expiresAt < now) {
      otpCache.delete(key);
    }
  }
}

// Clean expired OTPs every minute
setInterval(cleanExpiredOTPs, 60 * 1000);

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body as { username: string; password: string };
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        let ok = await comparePassword(password, user.password);
        
        // Fallback for plain text passwords
        if (!ok && user.password === password) {
            ok = true;
        }

        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        const token = signToken({ 
            id: user.id, 
            username: user.username, 
            role: user.role 
        });

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                phone: user.phone,
                role: user.role, 
                createdAt: user.createdAt 
            } 
        });
    } catch (err: any) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        
        const user = await prisma.user.findUnique({ 
            where: { id: req.user.id },
            select: { id: true, username: true, email: true, phone: true, role: true, createdAt: true }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (err: any) {
        console.error('Auth me error:', err);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
};

export const verifySecret = async (req: Request, res: Response) => {
    const { secretPassword } = req.body as { secretPassword: string };
    const user = req.user;
    
    if (!secretPassword) {
        return res.status(400).json({ error: 'Secret password is required' });
    }
    
    if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    try {
        const dbUser = await prisma.user.findUnique({ 
            where: { id: user.id },
            select: { secretPassword: true, role: true }
        });
        
        if (!dbUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (dbUser.secretPassword !== secretPassword) {
            return res.status(401).json({ error: 'Invalid secret password' });
        }
        
        res.json({ success: true, hasAccess: dbUser.role === 'HOST' });
    } catch (err: any) {
        console.error('Verify secret error:', err);
        res.status(500).json({ error: 'Failed to verify secret password' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body as { email: string };
    const user = req.user;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    try {
        const dbUser = await prisma.user.findUnique({ 
            where: { id: user.id },
            select: { email: true, role: true, username: true }
        });
        
        if (!dbUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (dbUser.email !== email) {
            return res.status(400).json({ error: `Email does not match your account. Your registered email is: ${dbUser.email}` });
        }
        
        if (dbUser.role !== 'HOST') {
            return res.status(403).json({ error: 'Only HOST users can reset secret password' });
        }
        
        const otp = generateOTP();
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes
        
        otpCache.set(token, {
            email,
            otp,
            expiresAt,
            used: false
        });
        
        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            otpCache.delete(token);
            return res.status(500).json({ error: 'Failed to send OTP email' });
        }
        
        res.json({ success: true, token, message: 'OTP sent to your email address' });
    } catch (err: any) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Failed to process forgot password request' });
    }
};

export const verifyOTP = async (req: Request, res: Response) => {
    const { email, otp, token } = req.body as { email: string; otp: string; token: string };
    const user = req.user;
    
    if (!email || !otp || !token) {
        return res.status(400).json({ error: 'Email, OTP, and token are required' });
    }
    
    if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    try {
        const dbUser = await prisma.user.findUnique({ 
            where: { id: user.id },
            select: { email: true }
        });
        
        if (!dbUser || dbUser.email !== email) {
            return res.status(400).json({ error: 'Invalid email' });
        }
        
        const otpData = otpCache.get(token);
        
        if (!otpData) {
            return res.status(400).json({ error: 'Invalid or expired OTP token' });
        }
        
        if (otpData.expiresAt < Date.now()) {
            otpCache.delete(token);
            return res.status(400).json({ error: 'OTP has expired' });
        }
        
        if (otpData.used) {
            return res.status(400).json({ error: 'OTP already used' });
        }
        
        if (otpData.email !== email || otpData.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP code' });
        }
        
        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (err: any) {
        console.error('OTP verification error:', err);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { email, otp, token, newPassword } = req.body as { 
        email: string; 
        otp: string; 
        token: string; 
        newPassword: string; 
    };
    const user = req.user;
    
    if (!email || !otp || !token || !newPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Secret password must be at least 6 characters long' });
    }
    
    if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    try {
        const dbUser = await prisma.user.findUnique({ 
            where: { id: user.id },
            select: { email: true, role: true }
        });
        
        if (!dbUser || dbUser.email !== email) {
            return res.status(400).json({ error: 'Invalid email' });
        }
        
        if (dbUser.role !== 'HOST') {
            return res.status(403).json({ error: 'Only HOST users can reset secret password' });
        }
        
        const otpData = otpCache.get(token);
        
        if (!otpData) {
            return res.status(400).json({ error: 'Invalid or expired OTP token' });
        }
        
        if (otpData.expiresAt < Date.now()) {
            otpCache.delete(token);
            return res.status(400).json({ error: 'OTP has expired' });
        }
        
        if (otpData.used) {
            return res.status(400).json({ error: 'OTP already used' });
        }
        
        if (otpData.email !== email || otpData.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        
        await prisma.user.update({
            where: { id: user.id },
            data: { secretPassword: newPassword }
        });
        
        otpCache.delete(token);
        
        res.json({ success: true, message: 'Secret password reset successfully' });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to reset secret password' });
    }
};