import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TaskEditForm from '@/components/TaskEditForm';

interface TaskEditPageProps {
  params: {
    id: string;
  };
}

export default async function TaskEditPage({ params }: TaskEditPageProps) {
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

  const task = await prisma.task.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      requester: true,
      assignee: true,
    },
  });

  if (!task) {
    notFound();
  }

  // 権限チェック
  const isRequester = task.requesterId === user.id;
  const isAssignee = task.assigneeId === user.id;
  const canEdit = isRequester || (isAssignee && user.role === 'assignee');

  if (!canEdit) {
    redirect('/tasks');
  }

  // 担当者一覧を取得（業務依頼者のみ）
  const assignees = user.role === 'requester' ? await prisma.user.findMany({
    where: {
      role: 'assignee',
    },
  }) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">タスク編集</h1>
      <TaskEditForm task={task} assignees={assignees} userRole={user.role} />
    </div>
  );
} 