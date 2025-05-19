import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import TaskStatusUpdate from '@/components/TaskStatusUpdate';

interface TaskDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
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
    notFound();
  }

  // 権限チェック
  const isRequester = task.requesterId === user.id;
  const isAssignee = task.assigneeId === user.id;
  const canView = isRequester || isAssignee;

  if (!canView) {
    redirect('/tasks');
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">タスク詳細</h1>
          <div className="space-x-4">
            {isRequester && (
            <Link
              href={`/tasks/${task.id}/edit`}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              編集
            </Link>
            )}
            <Link
              href="/tasks"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              一覧に戻る
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">業務情報</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">作業番号</dt>
                  <dd className="mt-1 text-sm text-gray-900">{task.workNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">顧客名</dt>
                  <dd className="mt-1 text-sm text-gray-900">{task.customerName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">車種</dt>
                  <dd className="mt-1 text-sm text-gray-900">{task.carModel}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">作業内容</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{task.taskDetail}</dd>
                </div>
              </dl>
            </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">スケジュール・担当</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">入庫日</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(task.inDate).toLocaleDateString('ja-JP')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">出庫予定日</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(task.outDate).toLocaleDateString('ja-JP')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">依頼者</dt>
                  <dd className="mt-1 text-sm text-gray-900">{task.requester.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">担当者</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {task.assignee ? task.assignee.name : '未割り当て'}
                  </dd>
                </div>
              </dl>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">ステータス</h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>
              <TaskStatusUpdate taskId={task.id} currentStatus={task.status} />
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">ステータス履歴</h2>
              <div className="space-y-4">
                {task.statusHistory.map((history) => (
                <div key={history.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(history.status)}`}>
                        {getStatusLabel(history.status)}
                      </span>
                    <span className="text-sm text-gray-500">
                      by {history.changedBy.name}
                      </span>
                    </div>
                  <span className="text-sm text-gray-500">
                      {new Date(history.changedAt).toLocaleString('ja-JP')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
} 