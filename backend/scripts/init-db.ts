#!/usr/bin/env node

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import DatabaseConfig from '../src/config/database';
import { DatabaseTest } from '../src/utils/dbTest';

// Load environment variables
dotenv.config();

async function initializeDatabase() {
  console.log('🔧 Initializing database...');
  
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    console.log('📋 DATABASE_URL found');
    
    // Generate Prisma client
    console.log('🔄 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Deploy migrations
    console.log('🔄 Deploying database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Test database connection
    console.log('🔄 Testing database connection...');
    const connectionTest = await DatabaseTest.testConnection();
    
    if (!connectionTest.success) {
      throw new Error(`Database connection failed: ${connectionTest.error}`);
    }
    
    // Test all tables
    console.log('🔄 Testing table access...');
    const tableTest = await DatabaseTest.testAllTables();
    
    if (!tableTest.success) {
      console.warn('⚠️  Some tables are not accessible:');
      if (tableTest.errors) {
        Object.entries(tableTest.errors).forEach(([table, error]) => {
          console.warn(`   - ${table}: ${error}`);
        });
      }
    }
    
    console.log('✅ Database initialization completed successfully');
    
    // Disconnect
    await DatabaseConfig.disconnect();
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();