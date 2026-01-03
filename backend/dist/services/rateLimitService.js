import { prisma } from '../config/database';
// Lockout sequence: 1min → 3min → 5min → 10min → 15min → 30min → 1hr → 2hr → 4hr → 8hr → 16hr → 32hr...
const LOCKOUT_DURATIONS = [1, 3, 5, 10, 15, 30, 60, 120, 240, 480, 960, 1920]; // minutes
export class RateLimitService {
    static async checkLoginAttempts(ipAddress) {
        const attempt = await prisma.loginAttempt.findUnique({
            where: { ipAddress }
        });
        if (!attempt) {
            return { allowed: true, remainingAttempts: 5, lockedUntil: null };
        }
        const now = new Date();
        // Check if locked and still within lockout period
        if (attempt.lockedUntil && attempt.lockedUntil > now) {
            const remainingTime = Math.ceil((attempt.lockedUntil.getTime() - now.getTime()) / 1000);
            return {
                allowed: false,
                remainingAttempts: 0,
                lockedUntil: attempt.lockedUntil,
                remainingTime
            };
        }
        // If lockout expired, give 2 attempts
        if (attempt.lockedUntil && attempt.lockedUntil <= now) {
            await prisma.loginAttempt.update({
                where: { ipAddress },
                data: {
                    attempts: 2,
                    lockedUntil: null,
                    lastAttemptAt: now
                }
            });
            return { allowed: true, remainingAttempts: 2, lockedUntil: null };
        }
        // Check 24-hour reset
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        if (attempt.lastAttemptAt < dayAgo) {
            await prisma.loginAttempt.update({
                where: { ipAddress },
                data: {
                    attempts: 5,
                    lockoutLevel: 0,
                    lockedUntil: null,
                    lastAttemptAt: now
                }
            });
            return { allowed: true, remainingAttempts: 5, lockedUntil: null };
        }
        return {
            allowed: attempt.attempts > 0,
            remainingAttempts: attempt.attempts,
            lockedUntil: attempt.lockedUntil
        };
    }
    static async recordFailedAttempt(ipAddress) {
        const now = new Date();
        let attempt = await prisma.loginAttempt.findUnique({
            where: { ipAddress }
        });
        if (!attempt) {
            attempt = await prisma.loginAttempt.create({
                data: {
                    ipAddress,
                    attempts: 4, // 5 - 1
                    lastAttemptAt: now
                }
            });
        }
        else {
            const newAttempts = Math.max(0, attempt.attempts - 1);
            let updateData = {
                attempts: newAttempts,
                lastAttemptAt: now
            };
            // If no attempts left, calculate lockout
            if (newAttempts === 0) {
                let lockoutIndex = attempt.lockoutLevel;
                // After 24 hours, reset to 3min (index 1) instead of 1min (index 0)
                const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                if (attempt.lastAttemptAt < dayAgo && attempt.lockoutLevel > 0) {
                    lockoutIndex = 1; // Start from 3min after 24hr reset
                }
                // Continue doubling after reaching the end of predefined sequence
                let lockoutMinutes;
                if (lockoutIndex < LOCKOUT_DURATIONS.length) {
                    lockoutMinutes = LOCKOUT_DURATIONS[lockoutIndex];
                }
                else {
                    // Double the last duration for subsequent lockouts
                    const lastDuration = LOCKOUT_DURATIONS[LOCKOUT_DURATIONS.length - 1];
                    const multiplier = Math.pow(2, lockoutIndex - LOCKOUT_DURATIONS.length + 1);
                    lockoutMinutes = lastDuration * multiplier;
                }
                updateData.lockedUntil = new Date(now.getTime() + lockoutMinutes * 60 * 1000);
                updateData.lockoutLevel = lockoutIndex + 1;
            }
            attempt = await prisma.loginAttempt.update({
                where: { ipAddress },
                data: updateData
            });
        }
        return attempt;
    }
    static async recordSuccessfulLogin(ipAddress) {
        await prisma.loginAttempt.upsert({
            where: { ipAddress },
            update: {
                attempts: 5,
                lockedUntil: null,
                lockoutLevel: 0,
                lastAttemptAt: new Date()
            },
            create: {
                ipAddress,
                attempts: 5,
                lastAttemptAt: new Date()
            }
        });
    }
}
//# sourceMappingURL=rateLimitService.js.map