import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserRole() {
  await prisma.user.update({
    where: { username: 'host' },
    data: { role: 'HOST' }
  });
  
  console.log('User role updated to HOST');
}

fixUserRole()
  .finally(() => prisma.$disconnect());