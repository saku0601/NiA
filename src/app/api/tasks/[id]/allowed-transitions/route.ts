import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TaskStatus, UserRole } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(params.id) },
    });
    if (!task) {
      return NextResponse.json({ error: 'タスクが見つかりません' }, { status: 404 });
    }
    // ここでは例として全てのTaskStatusを返す（本来はロジックに応じて制限）
    const allowedTransitions = [
      'pending',
      'accepted',
      'inProgress',
      'completed',
      'cancelled',
    ];
    return NextResponse.json({ allowedTransitions });
  } catch (error) {
    console.error('Error fetching allowed transitions:', error);
    return NextResponse.json(
      { error: '遷移可能ステータスの取得に失敗しました' },
      { status: 500 }
    );
  }
} 