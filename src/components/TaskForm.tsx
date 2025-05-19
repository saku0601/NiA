'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TaskStatus } from '@prisma/client';

export default function TaskForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      status: 'pending' as TaskStatus,
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('タスクの作成に失敗しました');
      }

      router.push('/tasks');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert('タスクの作成に失敗しました');
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
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

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
          {isSubmitting ? '作成中...' : '作成'}
        </button>
      </div>
    </form>
  );
} 