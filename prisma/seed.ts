import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('NiCo', 10);

  const user = await prisma.user.create({
    data: {
      name: 'NiCo',
      email: 'nico@example.com',
      password: hashedPassword,
      role: 'requester',
    },
  });

  console.log('Created user:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 