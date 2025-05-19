import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        requester: true,
        assignee: true,
        statusHistory: {
          include: {
            changedBy: true,
          },
          orderBy: {
            changedAt: 'desc',
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'タスクが見つかりません' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'タスクの取得に失敗しました' },
      { status: 500 }
    );
  }
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

    const data = await request.json();
    const taskId = parseInt(params.id);

    // 現在のタスクを取得
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!currentTask) {
      return NextResponse.json({ error: 'タスクが見つかりません' }, { status: 404 });
    }

    // ステータスが変更された場合、履歴を記録
    const statusChanged = currentTask.status !== data.status;

    // トランザクションで更新と履歴記録を実行
    const updatedTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { id: taskId },
        data: {
          workNumber: data.workNumber,
          customerName: data.customerName,
          carModel: data.carModel,
          taskDetail: data.taskDetail,
          inDate: new Date(data.inDate),
          outDate: new Date(data.outDate),
          status: data.status as TaskStatus,
          assigneeId: data.assigneeId,
        },
        include: {
          requester: true,
          assignee: true,
        },
      });

      if (statusChanged) {
        await tx.taskStatusHistory.create({
          data: {
            taskId: task.id,
            status: data.status as TaskStatus,
            userId: user.id,
          },
        });
      }

      return task;
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'タスクの更新に失敗しました' },
      { status: 500 }
    );
  }
} 