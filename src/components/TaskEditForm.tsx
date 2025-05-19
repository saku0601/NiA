'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task, User, TaskStatus, UserRole } from '@prisma/client';

type TaskWithRelations = Task & {
  requester: User;
  assignee: User | null;
};

interface TaskEditFormProps {
  task: TaskWithRelations;
  assignees: User[];
  userRole: UserRole;
}

export default function TaskEditForm({ task, assignees, userRole }: TaskEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRequester = userRole === 'requester';
  const isAssignee = userRole === 'assignee';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      workNumber: formData.get('workNumber'),
      customerName: formData.get('customerName'),
      carModel: formData.get('carModel'),
      taskDetail: formData.get('taskDetail'),
      inDate: formData.get('inDate'),
      outDate: formData.get('outDate'),
      status: formData.get('status') as TaskStatus,
      assigneeId: formData.get('assigneeId') ? parseInt(formData.get('assigneeId') as string) : null,
    };

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'タスクの更新に失敗しました');
      }

      router.push(`/tasks/${task.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'タスクの更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label htmlFor="workNumber" className="block text-sm font-medium text-gray-700">
          作業番号
        </label>
        <input
          type="text"
          name="workNumber"
          id="workNumber"
          defaultValue={task.workNumber}
          required
          disabled={isAssignee}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            isAssignee ? 'bg-gray-100' : ''
          }`}
        />
      </div>

      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
          顧客名
        </label>
        <input
          type="text"
          name="customerName"
          id="customerName"
          defaultValue={task.customerName}
          required
          disabled={isAssignee}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            isAssignee ? 'bg-gray-100' : ''
          }`}
        />
      </div>

      <div>
        <label htmlFor="carModel" className="block text-sm font-medium text-gray-700">
          車種
        </label>
        <input
          type="text"
          name="carModel"
          id="carModel"
          defaultValue={task.carModel}
          required
          disabled={isAssignee}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            isAssignee ? 'bg-gray-100' : ''
          }`}
        />
      </div>

      <div>
        <label htmlFor="taskDetail" className="block text-sm font-medium text-gray-700">
          作業内容
        </label>
        <textarea
          name="taskDetail"
          id="taskDetail"
          rows={4}
          defaultValue={task.taskDetail}
          required
          disabled={isAssignee}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            isAssignee ? 'bg-gray-100' : ''
          }`}
        />
      </div>

      <div>
        <label htmlFor="inDate" className="block text-sm font-medium text-gray-700">
          入庫日
        </label>
        <input
          type="date"
          name="inDate"
          id="inDate"
          defaultValue={new Date(task.inDate).toISOString().split('T')[0]}
          required
          disabled={isAssignee}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            isAssignee ? 'bg-gray-100' : ''
          }`}
        />
      </div>

      <div>
        <label htmlFor="outDate" className="block text-sm font-medium text-gray-700">
          出庫予定日
        </label>
        <input
          type="date"
          name="outDate"
          id="outDate"
          defaultValue={new Date(task.outDate).toISOString().split('T')[0]}
          required
          disabled={isAssignee}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            isAssignee ? 'bg-gray-100' : ''
          }`}
        />
      </div>

      {isRequester && (
        <>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              ステータス
            </label>
            <select
              name="status"
              id="status"
              defaultValue={task.status}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="pending">未受注</option>
              <option value="accepted">受注済み</option>
              <option value="inProgress">作業中</option>
              <option value="completed">完了</option>
              <option value="cancelled">キャンセル</option>
            </select>
          </div>

          <div>
            <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700">
              担当者
            </label>
            <select
              name="assigneeId"
              id="assigneeId"
              defaultValue={task.assigneeId || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">未割り当て</option>
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? '更新中...' : '更新'}
        </button>
      </div>
    </form>
  );
} 