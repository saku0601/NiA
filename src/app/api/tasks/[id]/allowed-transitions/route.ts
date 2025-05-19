import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { TaskStatus, UserRole } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

// ステータス遷移の権限チェック
async function getAllowedTransitions(
  currentStatus: TaskStatus,
  userRole: UserRole
): Promise<TaskStatus[]> {
  // assignee（担当者）は作業関連のステータス遷移のみ許可
  if (userRole === 'assignee') {
    switch (currentStatus) {
      case 'accepted':
        return ['inProgress'];
      case 'inProgress':
        return ['completed'];
      default:
        return [];
    }
  }

  // requester（依頼者）はキャンセルのみ許可
  if (userRole === 'requester') {
    if (currentStatus === 'pending') {
      return ['cancelled'];
    }
    return [];
  }

  return [];
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    const taskId = parseInt(params.id);
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'タスクが見つかりません' }, { status: 404 });
    }

    const allowedTransitions = await getAllowedTransitions(
      task.status,
      user.role as UserRole
    );

    return NextResponse.json({ allowedTransitions });
  } catch (error) {
    console.error('Error getting allowed transitions:', error);
    return NextResponse.json(
      { error: '許可されたステータス遷移の取得に失敗しました' },
      { status: 500 }
    );
  }
} 