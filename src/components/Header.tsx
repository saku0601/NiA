'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserRole } from '@prisma/client';

export default function Header() {
  const { data: session } = useSession();

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'requester':
        return '業務依頼者';
      case 'assignee':
        return '業務受託者';
      default:
        return role;
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              NiA
            </Link>
            <nav className="flex space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                カレンダー
              </Link>
              <Link
                href="/tasks"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                タスク一覧
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {session.user.name}
              </div>
              <div className="text-xs text-gray-500">
                {getRoleLabel(session.user.role as UserRole)}
              </div>
            </div>
            <Link
              href="/api/auth/signout"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              ログアウト
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 