import { prisma } from '@/lib/prisma';
import TaskEditForm from '@/components/TaskEditForm';

interface TaskEditPageProps {
  params: {
    id: string;
  };
}

export default async function TaskEditPage({ params }: TaskEditPageProps) {
  const task = await prisma.task.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      requester: true,
      assignee: true,
    },
  });

  if (!task) {
    return <div>タスクが見つかりません。</div>;
  }

  // 担当者一覧を取得（全ユーザーを取得）
  const assignees = await prisma.user.findMany({
    where: {
      role: 'assignee',
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">タスク編集</h1>
      <TaskEditForm task={task} assignees={assignees} userRole={task.requester?.role ?? ''} />
    </div>
  );
} 