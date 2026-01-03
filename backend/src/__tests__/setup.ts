import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test database instance
export const testDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Setup before all tests
beforeAll(async () => {
  // Ensure test database is clean
  await cleanDatabase();
});

// Cleanup after all tests
afterAll(async () => {
  await cleanDatabase();
  await testDb.$disconnect();
});

// Clean database helper
export async function cleanDatabase() {
  const tablenames = await testDb.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';
  `;

  for (const { name } of tablenames) {
    await testDb.$executeRawUnsafe(`DELETE FROM "${name}";`);
  }
}

// Create test user helper
export async function createTestUser(overrides = {}) {
  return await testDb.user.create({
    data: {
      username: 'testuser',
      email: 'test@example.com',
      phone: '1234567890',
      password: '$2a$10$test.hash.password', // Pre-hashed test password
      role: 'ENGINEER',
      ...overrides
    }
  });
}

