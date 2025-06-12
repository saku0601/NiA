import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type UserInfo = {
  id: string;
  email: string;
  name: string;
  role: string;
};

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      // パスワードは表示しない（セキュリティのため）
    },
  });

  console.log('登録ユーザー一覧:');
  console.log('-------------------');
  users.forEach((user: UserInfo) => {
    console.log(`ID: ${user.id}`);
    console.log(`名前: ${user.name}`);
    console.log(`メール: ${user.email}`);
    console.log(`権限: ${user.role}`);
    console.log('-------------------');
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 