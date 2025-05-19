const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // 既存のユーザーを削除
    await prisma.user.deleteMany({
      where: {
        email: 'nico@example.com',
      },
    });

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
  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 