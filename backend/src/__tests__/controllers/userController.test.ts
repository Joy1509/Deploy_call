import request from 'supertest';
import express from 'express';
import { testDb, createTestUser, cleanDatabase } from '../setup';
import { createUser, getUsers, updateUser, deleteUser } from '../../controllers/userController';
import { authMiddleware, requireRole } from '../../middleware/auth';

// Create test app
const app = express();
app.use(express.json());

// Setup routes
app.post('/users', authMiddleware, requireRole(['ADMIN', 'HOST']), createUser);
app.get('/users', authMiddleware, getUsers);
app.put('/users/:id', authMiddleware, requireRole(['ADMIN', 'HOST']), updateUser);
app.delete('/users/:id', authMiddleware, requireRole(['ADMIN', 'HOST']), deleteUser);

describe('User Controller', () => {
  let adminToken: string;
  let adminUser: any;

  beforeEach(async () => {
    await cleanDatabase();
    
    // Create admin user and get token
    adminUser = await createTestUser({
      username: 'admin',
      role: 'ADMIN',
      password: 'adminpass123'
    });

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'adminpass123'
      });

    adminToken = loginResponse.body.token;
  });

  describe('POST /users', () => {
    it('should create user with valid data', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        phone: '9876543210',
        password: 'NewPass123!',
        role: 'ENGINEER'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.user.username).toBe('newuser');
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject weak password', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        phone: '9876543210',
        password: 'weak', // Doesn't meet requirements
        role: 'ENGINEER'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Password must be at least 8 characters');
    });

    it('should reject invalid email', async () => {
      const userData = {
        username: 'newuser',
        email: 'invalid-email',
        phone: '9876543210',
        password: 'ValidPass123!',
        role: 'ENGINEER'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid email address');
    });

    it('should reject duplicate username', async () => {
      // Create first user
      await createTestUser({ username: 'duplicate' });

      const userData = {
        username: 'duplicate',
        email: 'new@example.com',
        phone: '9876543210',
        password: 'ValidPass123!',
        role: 'ENGINEER'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username already exists');
    });

    it('should require admin role', async () => {
      // Create regular user
      const regularUser = await createTestUser({
        username: 'regular',
        role: 'ENGINEER'
      });

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'regular',
          password: 'testpassword123'
        });

      const regularToken = loginResponse.body.token;

      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        phone: '9876543210',
        password: 'ValidPass123!',
        role: 'ENGINEER'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(userData);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      // Create additional test users
      await createTestUser({ username: 'user1', email: 'user1@test.com' });
      await createTestUser({ username: 'user2', email: 'user2@test.com' });

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3); // admin + 2 test users
      
      // Check that passwords are not included
      response.body.forEach((user: any) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/users');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user data', async () => {
      const user = await createTestUser({
        username: 'updateme',
        email: 'old@example.com'
      });

      const updateData = {
        email: 'new@example.com',
        phone: '1111111111'
      };

      const response = await request(app)
        .put(`/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('new@example.com');
      expect(response.body.user.phone).toBe('1111111111');
    });

    it('should reject invalid user ID', async () => {
      const response = await request(app)
        .put('/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'new@example.com' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      const user = await createTestUser({
        username: 'deleteme'
      });

      const response = await request(app)
        .delete(`/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User deleted successfully');

      // Verify user is deleted
      const deletedUser = await testDb.user.findUnique({
        where: { id: user.id }
      });
      expect(deletedUser).toBeNull();
    });

    it('should reject invalid user ID', async () => {
      const response = await request(app)
        .delete('/users/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });
});