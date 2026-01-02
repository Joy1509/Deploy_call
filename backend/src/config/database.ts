import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function initializeDatabase() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
        
        const userCount = await prisma.user.count();
        console.log(`Database initialized. User count: ${userCount}`);
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}

export async function disconnectDatabase() {
    try {
        await prisma.$disconnect();
        console.log('Database disconnected');
    } catch (err) {
        console.error('Error during database disconnect:', err);
    }
}