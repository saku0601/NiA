import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    // 全ユーザーの依頼タスクを取得（認証なし）
    const tasks = await prisma.task.findMany({
      include: {
        assignee: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error in GET /api/tasks/requested:', error);
    return NextResponse.json(
      { message: '業務一覧の取得中にエラーが発生しました。' },
      { status: 500 }
    );
  }
} 