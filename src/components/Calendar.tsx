'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  startDate: Date;
  endDate: Date;
  requester: {
    name: string;
  };
  assignee: {
    name: string;
  };
}

const statusLabels = {
  pending: '未着手',
  in_progress: '進行中',
  completed: '完了',
};

const statusOptions = [
  { value: 'pending', label: '未着手' },
  { value: 'in_progress', label: '進行中' },
  { value: 'completed', label: '完了' },
];

const isBrowser = typeof window !== 'undefined';

export default function Calendar({ onDateSelect, selectedDate, setSelectedDate }: CalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      await fetchTasks();
      if (selectedTask) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('ステータスの更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };

  const events = tasks.map(task => ({
    id: task.id.toString(),
    title: task.title,
    start: task.startDate,
    end: task.endDate,
    backgroundColor: 
      task.status === 'completed' ? '#10B981' : // 緑
      task.status === 'in_progress' ? '#3B82F6' : // 青
      '#6B7280', // グレー
    borderColor: 
      task.status === 'completed' ? '#059669' :
      task.status === 'in_progress' ? '#2563EB' :
      '#4B5563',
    extendedProps: {
      description: task.description,
      requester: task.requester?.name ?? '不明',
      assignee: task.assignee?.name ?? '未割り当て',
      status: task.status,
    },
  }));

  const ModalOverlay = () => {
    if (!selectedTask && !selectedDate) return null;

    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999
        }}
      >
        <div 
          className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 relative"
          style={{
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            maxWidth: '32rem',
            width: '100%',
            margin: '0 1rem'
          }}
        >
          {selectedTask ? (
            <>
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedTask(null)}
                aria-label="閉じる"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-2">{selectedTask.title}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">説明</label>
                  <p className="text-gray-600">{selectedTask.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ステータス</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => updateTaskStatus(selectedTask.id, e.target.value)}
                    disabled={isUpdating}
                    className={`w-full p-2 border rounded ${
                      selectedTask.status === 'completed' ? 'bg-green-100' :
                      selectedTask.status === 'in_progress' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">依頼者</label>
                    <p className="text-gray-600">
                      {selectedTask.requester?.name ?? '不明'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">担当者</label>
                    <p className="text-gray-600">
                      {selectedTask.assignee?.name ?? '未割り当て'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">開始日</label>
                    <p className="text-gray-600">
                      {new Date(selectedTask.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">終了日</label>
                    <p className="text-gray-600">
                      {new Date(selectedTask.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : selectedDate ? (
            <>
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedDate(null)}
                aria-label="閉じる"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">
                {selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}の予定
              </h2>
              <div className="space-y-4">
                {tasks.filter(task => {
                  const taskDate = new Date(task.startDate);
                  return taskDate.toDateString() === selectedDate.toDateString();
                }).map(task => (
                  <div key={task.id} className="border-b pb-4">
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {statusLabels[task.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                  </div>
                ))}
                {tasks.filter(task => {
                  const taskDate = new Date(task.startDate);
                  return taskDate.toDateString() === selectedDate.toDateString();
                }).length === 0 && (
                  <p className="text-gray-500">この日の予定はありません</p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="bg-red-500">テスト</div>
      <div className="bg-white p-4 rounded-lg shadow">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          select={(info) => {
            console.log('Calendar date selected:', info.start);
            const date = info.start;
            setSelectedDate(date);
            onDateSelect(date);
          }}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
          height="auto"
          events={events}
          eventClick={(info) => {
            const task = tasks.find(t => t.id.toString() === info.event.id);
            if (task) {
              setSelectedTask(task);
            }
          }}
        />
      </div>
      <ModalOverlay />
    </div>
  );
} 