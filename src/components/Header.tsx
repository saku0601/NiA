'use client';

import Link from 'next/link';

export default function Header() {
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
                ゲスト
              </div>
              <div className="text-xs text-gray-500">
                {/* ロール表示不要なら空でOK */}
              </div>
            </div>
            {/* ログアウトボタンも不要なら削除 */}
          </div>
        </div>
      </div>
    </header>
  );
} 