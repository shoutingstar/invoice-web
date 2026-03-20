/**
 * 인증 영역(auth) 전용 헤더
 * 공개 영역과 달리 사용자명과 로그아웃 버튼 표시
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export function AuthHeader() {
  const handleLogout = () => {
    // TODO: 실제 로그아웃 처리 (Phase 3 auth actions)
    console.log('로그아웃');
  };

  return (
    <header className="border-b bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 로고/대시보드 버튼 */}
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="hidden font-semibold sm:inline">Invoice Web</span>
          </Link>

          {/* 오른쪽: 사용자 정보 및 로그아웃 */}
          <div className="flex items-center gap-4">
            <div className="hidden text-right text-sm sm:block">
              <div className="font-medium">김담당</div>
              <div className="text-xs text-muted-foreground">kim@company.com</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">로그아웃</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
