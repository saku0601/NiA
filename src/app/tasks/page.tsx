import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TaskList from '@/components/TaskList';
import Link from 'next/link';

export default async function TasksPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  // ユーザーロールに基づいてタスクを取得
  const tasks = await prisma.task.findMany({
    where: user.role === 'requester' 
      ? { requesterId: user.id }  // 依頼者は自分が依頼したタスクのみ
      : { assigneeId: user.id },  // 受託者は自分が担当しているタスクのみ
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {user.role === 'requester' ? '依頼した業務一覧' : '担当業務一覧'}
        </h1>
        <div className="space-x-4">
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            カレンダー画面へ戻る
          </Link>
          {user.role === 'requester' && (
            <Link
              href="/tasks/new"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              新規作成
            </Link>
          )}
        </div>
      </div>
      <TaskList tasks={tasks} />
    </div>
  );
} 