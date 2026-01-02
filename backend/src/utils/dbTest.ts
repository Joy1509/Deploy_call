import DatabaseConfig, { prisma } from '../config/database';

export class DatabaseTest {
  public static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test basic connection
      await prisma.$connect();
      
      // Test query execution
      await prisma.$queryRaw`SELECT 1 as test`;
      
      // Test table access
      await prisma.user.findFirst();
      
      console.log('✅ Database connection test passed');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Database connection test failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  public static async testAllTables(): Promise<{ success: boolean; results: Record<string, boolean>; errors?: Record<string, string> }> {
    const results: Record<string, boolean> = {};
    const errors: Record<string, string> = {};
    
    const tables = [
      { name: 'User', model: prisma.user },
      { name: 'Call', model: prisma.call },
      { name: 'Customer', model: prisma.customer },
      { name: 'Notification', model: prisma.notification },
      { name: 'Category', model: prisma.category },
      { name: 'ServiceCategory', model: prisma.serviceCategory },
      { name: 'CarryInService', model: prisma.carryInService },
      { name: 'OtpToken', model: prisma.otpToken }
    ];

    for (const table of tables) {
      try {
        await table.model.findFirst();
        results[table.name] = true;
        console.log(`✅ ${table.name} table accessible`);
      } catch (error) {
        results[table.name] = false;
        errors[table.name] = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ ${table.name} table error:`, errors[table.name]);
      }
    }

    const success = Object.values(results).every(result => result);
    return { success, results, errors: Object.keys(errors).length > 0 ? errors : undefined };
  }
}