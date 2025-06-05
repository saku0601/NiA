import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  const name = await question('名前: ');
  const email = await question('メールアドレス: ');
  const password = await question('パスワード: ');
  const roleInput = await question('ロール（requester/assignee）: ');

  const role = roleInput;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role as UserRole,
    },
  });

  console.log('ユーザーを作成しました:', user);
  rl.close();
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  rl.close();
  prisma.$disconnect();
}); 