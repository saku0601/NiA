'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Task, User } from '@prisma/client';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type TaskWithRelations = Task & {
  requester: User;
  assignee: User | null;
};

interface TaskListProps {
  tasks: TaskWithRelations[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 border-b text-left">作業番号</th>
            <th className="px-6 py-3 border-b text-left">顧客名</th>
            <th className="px-6 py-3 border-b text-left">車種</th>
            <th className="px-6 py-3 border-b text-left">入庫日</th>
            <th className="px-6 py-3 border-b text-left">出庫予定日</th>
            <th className="px-6 py-3 border-b text-left">ステータス</th>
            <th className="px-6 py-3 border-b text-left">担当者</th>
            <th className="px-6 py-3 border-b text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {safeTasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 border-b">{task.workNumber}</td>
              <td className="px-6 py-4 border-b">{task.customerName}</td>
              <td className="px-6 py-4 border-b">{task.carModel}</td>
              <td className="px-6 py-4 border-b">
                {new Date(task.inDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 border-b">
                {new Date(task.outDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 border-b">
                <span className={`px-2 py-1 rounded text-sm ${
                  task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'inProgress' ? 'bg-green-100 text-green-800' :
                  task.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {task.status === 'pending' ? '未受注' :
                   task.status === 'accepted' ? '受注済み' :
                   task.status === 'inProgress' ? '作業中' :
                   task.status === 'completed' ? '完了' :
                   'キャンセル'}
                </span>
              </td>
              <td className="px-6 py-4 border-b">
                {task.assignee?.name || '未割り当て'}
              </td>
              <td className="px-6 py-4 border-b">
                <Link
                  href={`/tasks/${task.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  詳細
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 