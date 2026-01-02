import { PrismaClient } from '@prisma/client';

class DatabaseConfig {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseConfig.instance) {
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is required but not found. Please check your .env file.');
      }

      DatabaseConfig.instance = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl
          }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        errorFormat: 'pretty'
      });
      
      // Handle graceful shutdown
      process.on('beforeExit', async () => {
        console.log('Prisma is disconnecting...');
        await DatabaseConfig.instance.$disconnect();
      });
    }
    return DatabaseConfig.instance;
  }

  public static async connect(): Promise<void> {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const prisma = DatabaseConfig.getInstance();
        await prisma.$connect();
        
        // Test the connection
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connected successfully');
        return;
      } catch (error) {
        retryCount++;
        console.error(`❌ Database connection failed (attempt ${retryCount}/${maxRetries}):`, error);
        
        if (retryCount >= maxRetries) {
          throw new Error(`Database connection failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      if (DatabaseConfig.instance) {
        await DatabaseConfig.instance.$disconnect();
        console.log('✅ Database disconnected');
      }
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const prisma = DatabaseConfig.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  public static async withRetry<T>(operation: () => Promise<T>, maxRetries: number = 2): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Check if it's a connection error
        if (error instanceof Error && error.message.includes("Can't reach database server")) {
          if (attempt < maxRetries) {
            console.log(`Database operation failed, retrying... (attempt ${attempt + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
        }
        
        throw error;
      }
    }
    
    throw lastError!;
  }
}

export const prisma = DatabaseConfig.getInstance();
export default DatabaseConfig;