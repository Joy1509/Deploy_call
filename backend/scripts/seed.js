import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_HOST_USERNAME || 'host';
  const password = process.env.SEED_HOST_PASSWORD || 'hostpass123';
  const role = 'HOST';

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { username },
    update: { password: hashed, role },
    create: { username, password: hashed, role },
  });

  console.log(`Seeded user: ${user.username} (role=${user.role})`);
  console.log(`Use credentials -> username: ${username}, password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
