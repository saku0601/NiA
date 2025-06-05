import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 既存のユーザーを確認
  const existingUser = await prisma.user.findUnique({
    where: {
      email: 'test@example.com',
    },
  });

  if (!existingUser) {
    const password = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        name: 'テストユーザー',
        email: 'test@example.com',
        password,
        role: 'requester', // ←必ず小文字
      },
    });
    console.log('テストユーザーを作成しました');
  } else {
    console.log('テストユーザーは既に存在します');
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