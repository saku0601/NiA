'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// TaskStatusの型を自前で定義（Prismaからのimport不要）
type TaskStatus = 'pending' | 'accepted' | 'inProgress' | 'completed' | 'cancelled';

interface TaskStatusUpdateProps {
  taskId: number;
  currentStatus: TaskStatus;
}

export default function TaskStatusUpdate({ taskId, currentStatus }: TaskStatusUpdateProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [allowedTransitions, setAllowedTransitions] = useState<TaskStatus[]>([]);

  useEffect(() => {
    const fetchAllowedTransitions = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}/allowed-transitions`);
        if (response.ok) {
          const data = await response.json();
          setAllowedTransitions(data.allowedTransitions);
        }
      } catch (error) {
        console.error('Error fetching allowed transitions:', error);
      }
    };

    fetchAllowedTransitions();
  }, [taskId]);

  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    if (newStatus === currentStatus) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'ステータスの更新に失敗しました');
      }

      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'ステータスの更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusButtonClass = (status: TaskStatus) => {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-medium transition-colors';
    const isCurrentStatus = status === currentStatus;
    const isAllowed = allowedTransitions.includes(status);

    if (isCurrentStatus) {
      switch (status) {
        case 'pending': return `${baseClass} bg-yellow-100 text-yellow-800`;
        case 'accepted': return `${baseClass} bg-blue-100 text-blue-800`;
        case 'inProgress': return `${baseClass} bg-purple-100 text-purple-800`;
        case 'completed': return `${baseClass} bg-green-100 text-green-800`;
        case 'cancelled': return `${baseClass} bg-red-100 text-red-800`;
        default: return baseClass;
      }
    }

    if (!isAllowed) {
      return `${baseClass} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }

    switch (status) {
      case 'pending': return `${baseClass} bg-yellow-50 text-yellow-600 hover:bg-yellow-100`;
      case 'accepted': return `${baseClass} bg-blue-50 text-blue-600 hover:bg-blue-100`;
      case 'inProgress': return `${baseClass} bg-purple-50 text-purple-600 hover:bg-purple-100`;
      case 'completed': return `${baseClass} bg-green-50 text-green-600 hover:bg-green-100`;
      case 'cancelled': return `${baseClass} bg-red-50 text-red-600 hover:bg-red-100`;
      default: return baseClass;
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'pending': return '未受注';
      case 'accepted': return '受注済み';
      case 'inProgress': return '作業中';
      case 'completed': return '完了';
      case 'cancelled': return 'キャンセル';
      default: return status;
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">ステータス更新</h3>
      <div className="flex flex-wrap gap-2">
        {(Object.values(['pending', 'accepted', 'inProgress', 'completed', 'cancelled']) as TaskStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusUpdate(status)}
            disabled={isUpdating || status === currentStatus || !allowedTransitions.includes(status)}
            className={getStatusButtonClass(status)}
            title={!allowedTransitions.includes(status) ? 'このステータス変更の権限がありません' : ''}
          >
            {getStatusLabel(status)}
          </button>
        ))}
      </div>
    </div>
  );
} 