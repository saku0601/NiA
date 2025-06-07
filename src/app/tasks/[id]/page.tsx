import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import TaskStatusUpdate from '@/components/TaskStatusUpdate';

interface TaskDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const task = await prisma.task.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      requester: true,
      assignee: true,
      statusHistory: {
        include: {
          changedBy: true,
        },
        orderBy: {
          changedAt: 'desc',
        },
      },
    },
  });

  if (!task) {
    return <div>タスクが見つかりません。</div>;
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '未受注';
      case 'accepted': return '受注済み';
      case 'inProgress': return '作業中';
      case 'completed': return '完了';
      case 'cancelled': return 'キャンセル';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'inProgress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">タスク詳細</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
        </div>
        <div className="mb-2">タイトル: {task.title}</div>
        <div className="mb-2">依頼者: {task.requester?.name}</div>
        <div className="mb-2">担当者: {task.assignee?.name ?? '未割当'}</div>
        <div className="mb-2">作業予定日: {task.workDate ? new Date(task.workDate).toLocaleDateString() : '未定'}</div>
        <div className="mb-2">詳細: {task.description}</div>
        <div className="mb-2">作成日: {new Date(task.createdAt).toLocaleString()}</div>
        <div className="mb-2">更新日: {new Date(task.updatedAt).toLocaleString()}</div>
      </div>
      <Link href="/tasks" className="text-blue-500 hover:underline">一覧に戻る</Link>
      {/* 必要に応じてTaskStatusUpdateなどの機能を残す場合はここに追加 */}
    </div>
  );
} 