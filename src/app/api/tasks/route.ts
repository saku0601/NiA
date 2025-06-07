import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const inDate = data.inDate ? new Date(data.inDate) : undefined;
    const outDate = data.outDate ? new Date(data.outDate) : undefined;

    const task = await prisma.task.create({
      data: {
        ...data,
        startDate: inDate,
        endDate: outDate,
        inDate: inDate,
        outDate: outDate,
        title: String(data.title ?? `${data.workNumber ?? ''} ${data.customerName ?? ''}`),
        description: String(data.taskDetail ?? ''),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'タスクの作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'タスク一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
} 