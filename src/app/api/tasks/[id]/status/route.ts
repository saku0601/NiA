import { NextResponse } from 'next/server';
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

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { status, userId } = await request.json();
    if (!status || !userId) {
      return NextResponse.json({ error: 'statusとuserIdは必須です' }, { status: 400 });
    }
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(params.id) },
      data: { status },
    });
    await prisma.taskStatusHistory.create({
      data: {
        taskId: updatedTask.id,
        status,
        userId,
      },
    });
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { error: 'タスクステータスの更新に失敗しました' },
      { status: 500 }
    );
  }
} 