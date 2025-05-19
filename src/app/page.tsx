'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Calendar from '../components/Calendar';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import Navbar from '../components/Navbar';

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const router = useRouter();

  // タスク一覧をAPIから取得
  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('タスク取得失敗');
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      setTasks([]);
    }
  };

  useEffect(() => {
    if (session) fetchTasks();
  }, [session]);

  // 認証状態の確認
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-8">NiA～コーティング業務管理～</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">カレンダー</h2>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  新規業務依頼
                </button>
              </div>
              <Calendar onDateSelect={setSelectedDate} />
            </div>
          </div>
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <TaskList tasks={tasks} />
            </div>
          </div>
        </div>
      </main>

      {showTaskForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
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
            <div className="relative mb-6">
              <button
                onClick={() => setShowTaskForm(false)}
                className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold text-center w-full">業務依頼</h2>
            </div>
            <div className="text-center">
              <TaskForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 