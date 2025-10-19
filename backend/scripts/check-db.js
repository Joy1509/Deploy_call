import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

(async function(){
  try {
    console.log('DATABASE_URL=', process.env.DATABASE_URL);
    console.log('Attempting prisma.$connect()...');
    await prisma.$connect();
    console.log('Connected OK');
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Prisma connect failed:');
    console.error(err);
    process.exit(1);
  }
})();
