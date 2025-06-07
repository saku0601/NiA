import { prisma } from '@/lib/prisma';
import TaskList from '@/components/TaskList';
import Link from 'next/link';

export default async function TasksPage() {
  // 全タスクを取得（認証なし）
  const tasks = await prisma.task.findMany({
    include: {
      requester: true,
      assignee: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">タスク一覧</h1>
      <TaskList tasks={tasks} />
      <div className="mt-4">
        <Link href="/tasks/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          新規タスク作成
        </Link>
      </div>
    </div>
  );
} 