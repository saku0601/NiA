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
async function checkStatusTransitionPermission(
  fromStatus: TaskStatus,
  toStatus: TaskStatus,
  userRole: UserRole
): Promise<boolean> {
  // assignee（担当者）は作業関連のステータス遷移のみ許可
  if (userRole === 'assignee') {
    if (fromStatus === 'accepted' && toStatus === 'inProgress') return true;
    if (fromStatus === 'inProgress' && toStatus === 'completed') return true;
    return false;
  }

  // requester（依頼者）はキャンセルのみ許可
  if (userRole === 'requester') {
    if (fromStatus === 'pending' && toStatus === 'cancelled') return true;
    return false;
  }

  return false;
}

export async function PUT(request: Request, { params }: RouteParams) {
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

    const { status } = await request.json();
    const taskId = parseInt(params.id);

    // 現在のタスクを取得
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!currentTask) {
      return NextResponse.json({ error: 'タスクが見つかりません' }, { status: 404 });
    }

    // ステータス遷移の権限チェック
    const hasPermission = await checkStatusTransitionPermission(
      currentTask.status,
      status as TaskStatus,
      user.role as UserRole
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'このステータス変更の権限がありません' },
        { status: 403 }
      );
    }

    // ステータスが変更された場合のみ更新を実行
    if (currentTask.status !== status) {
      const updatedTask = await prisma.$transaction(async (tx) => {
        // タスクのステータスを更新
        const task = await tx.task.update({
          where: { id: taskId },
          data: { status: status as TaskStatus },
          include: {
            requester: true,
            assignee: true,
          },
        });

        // ステータス変更履歴を記録
        await tx.taskStatusHistory.create({
          data: {
            taskId: task.id,
            status: status as TaskStatus,
            userId: user.id,
          },
        });

        return task;
      });

      return NextResponse.json(updatedTask);
    }

    return NextResponse.json(currentTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { error: 'ステータスの更新に失敗しました' },
      { status: 500 }
    );
  }
} 