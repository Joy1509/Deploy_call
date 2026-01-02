import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserRole() {
  const user = await prisma.user.findUnique({
    where: { username: 'host' }
  });
  
  console.log('User details:', {
    username: user?.username,
    role: user?.role,
    roleType: typeof user?.role
  });
}

checkUserRole()
  .finally(() => prisma.$disconnect());