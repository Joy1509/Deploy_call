const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupRateLimit() {
    try {
        console.log('Cleaning up rate limiting data...');
        
        const result = await prisma.loginAttempt.deleteMany({});
        console.log(`Deleted ${result.count} login attempt records`);
        
        console.log('Rate limiting data cleaned up successfully!');
    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupRateLimit();