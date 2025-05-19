import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import TaskForm from '@/components/TaskForm';

export default async function NewTaskPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">新規タスク作成</h1>
      <TaskForm />
    </div>
  );
} 