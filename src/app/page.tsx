'use client';

import { useState, useEffect } from 'react';
import Calendar from '../components/Calendar';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import Navbar from '../components/Navbar';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState([]);

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
    fetchTasks();
  }, []);

  return (
    <div>
      <Navbar />
      <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <button onClick={() => setShowTaskForm(!showTaskForm)}>
        {showTaskForm ? 'フォームを閉じる' : 'タスク追加'}
      </button>
      {showTaskForm && <TaskForm />}
      <TaskList tasks={tasks} />
    </div>
  );
} 