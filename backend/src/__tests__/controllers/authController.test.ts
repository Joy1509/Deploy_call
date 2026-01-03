import request from 'supertest';
import express from 'express';
import { testDb, createTestUser, cleanDatabase } from '../setup';
import { login, checkLoginStatus, getMe, verifySecret } from '../../controllers/authController';
import { authenticateToken } from '../../middleware/auth';
import { RateLimitService } from '../../services/rateLimitService';

// Create test app
const app = express();
app.use(express.json());

// Setup routes
app.post('/auth/login', login);
app.get('/auth/login-status', checkLoginStatus);
app.get('/auth/me', authenticateToken, getMe);
app.post('/auth/verify-secret', authenticateToken, verifySecret);

describe('Auth Controller', () => {
  beforeEach(async () => {
    await cleanDatabase();
    // Reset rate limiting for each test
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create test user with known password
      await createTestUser({
        username: 'testuser',
        password: 'testpassword123' // Plain text for this test
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'testpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject invalid credentials', async () => {
      await createTestUser({
        username: 'testuser',
        password: 'correctpassword'
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should require username and password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser'
          // Missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password are required');
    });
  });

  describe('GET /auth/login-status', () => {
    it('should return login status', async () => {
      const response = await request(app)
        .get('/auth/login-status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('blocked');
      expect(response.body).toHaveProperty('remainingAttempts');
    });
  });

  describe('GET /auth/me', () => {
    it('should return user data with valid token', async () => {
      const user = await createTestUser();
      
      // First login to get token
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: user.username,
          password: 'testpassword123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(user.id);
      expect(response.body.username).toBe(user.username);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/auth/me');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/verify-secret', () => {
    it('should verify correct secret password', async () => {
      const user = await createTestUser({
        secretPassword: 'secret123',
        role: 'HOST'
      });

      // Login first
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: user.username,
          password: 'testpassword123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/auth/verify-secret')
        .set('Authorization', `Bearer ${token}`)
        .send({
          secretPassword: 'secret123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.hasAccess).toBe(true);
    });

    it('should reject incorrect secret password', async () => {
      const user = await createTestUser({
        secretPassword: 'secret123'
      });

      // Login first
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: user.username,
          password: 'testpassword123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/auth/verify-secret')
        .set('Authorization', `Bearer ${token}`)
        .send({
          secretPassword: 'wrongsecret'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid secret password');
    });
  });
});