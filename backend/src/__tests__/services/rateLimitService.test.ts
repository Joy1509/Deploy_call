import { RateLimitService } from '../../services/rateLimitService';
import { testDb, cleanDatabase } from '../setup';

describe('RateLimitService', () => {
  const testIP = '192.168.1.100';

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('checkLoginAttempts', () => {
    it('should allow login for new IP', async () => {
      const result = await RateLimitService.checkLoginAttempts(testIP);
      
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(3);
      expect(result.remainingTime).toBeNull();
    });

    it('should track failed attempts', async () => {
      // First failed attempt
      await RateLimitService.recordFailedAttempt(testIP);
      
      const result = await RateLimitService.checkLoginAttempts(testIP);
      
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(2);
    });

    it('should block after 3 failed attempts', async () => {
      // Record 3 failed attempts
      await RateLimitService.recordFailedAttempt(testIP);
      await RateLimitService.recordFailedAttempt(testIP);
      await RateLimitService.recordFailedAttempt(testIP);
      
      const result = await RateLimitService.checkLoginAttempts(testIP);
      
      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
      expect(result.remainingTime).toBeGreaterThan(0);
    });

    it('should increase lockout time with more attempts', async () => {
      // Simulate multiple lockout cycles
      for (let i = 0; i < 6; i++) {
        await RateLimitService.recordFailedAttempt(testIP);
      }
      
      const result = await RateLimitService.checkLoginAttempts(testIP);
      
      expect(result.allowed).toBe(false);
      expect(result.remainingTime).toBeGreaterThan(60000); // More than 1 minute
    });
  });

  describe('recordSuccessfulLogin', () => {
    it('should reset failed attempts on successful login', async () => {
      // Record some failed attempts
      await RateLimitService.recordFailedAttempt(testIP);
      await RateLimitService.recordFailedAttempt(testIP);
      
      // Successful login should reset
      await RateLimitService.recordSuccessfulLogin(testIP);
      
      const result = await RateLimitService.checkLoginAttempts(testIP);
      
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(3);
    });
  });

  describe('recordFailedAttempt', () => {
    it('should create rate limit record for new IP', async () => {
      await RateLimitService.recordFailedAttempt(testIP);
      
      const record = await testDb.rateLimitAttempt.findUnique({
        where: { ipAddress: testIP }
      });
      
      expect(record).toBeTruthy();
      expect(record?.attempts).toBe(1);
    });

    it('should increment attempts for existing IP', async () => {
      await RateLimitService.recordFailedAttempt(testIP);
      await RateLimitService.recordFailedAttempt(testIP);
      
      const record = await testDb.rateLimitAttempt.findUnique({
        where: { ipAddress: testIP }
      });
      
      expect(record?.attempts).toBe(2);
    });
  });

  describe('cleanup', () => {
    it('should remove old rate limit records', async () => {
      // Create old record (simulate by manually setting old date)
      await testDb.rateLimitAttempt.create({
        data: {
          ipAddress: testIP,
          attempts: 1,
          lastAttempt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
          lockedUntil: null
        }
      });
      
      await RateLimitService.cleanup();
      
      const record = await testDb.rateLimitAttempt.findUnique({
        where: { ipAddress: testIP }
      });
      
      expect(record).toBeNull();
    });
  });
});