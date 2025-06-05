export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../lib/prisma.js';
import { authOptions } from '../../auth/[...nextauth]/authOptions.js';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: '認証が必要です。' },
        { status: 401 }
      );
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'ユーザーが見つかりません。' },
        { status: 404 }
      );
    }

    // ユーザーが依頼した業務を取得
    const tasks = await prisma.task.findMany({
      where: {
        requesterId: user.id,
      },
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