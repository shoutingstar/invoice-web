/**
 * 인증 영역(auth) 전용 헤더
 * Server Component에서 세션을 읽고 LogoutButton, ThemeToggle만 Client Component로 분리
 */

import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/layout/logout-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LayoutDashboard, ChevronRight, FileText } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { auth } from '@/auth'

export async function AuthHeader() {
  const session = await auth()
  const user = session?.user
  const userName = user?.name ?? '사용자'
  const userEmail = user?.email ?? ''
  const userInitial = userName.charAt(0)
  // 세션에서 role 읽기 (타입 선언: src/types/next-auth.d.ts)
  const userRole = user?.role ?? 'user'

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* 왼쪽: 로고 + 네비게이션 */}
          <div className="flex items-center gap-1">
            {/* 로고 링크 */}
            <Link
              href={ROUTES.DASHBOARD}
              className="hover:bg-accent focus-visible:ring-ring flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              aria-label="대시보드로 이동"
            >
              {/* 로고 아이콘: bg-primary로 테마 연동 */}
              <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-md">
                <LayoutDashboard
                  className="text-primary-foreground h-4 w-4"
                  aria-hidden="true"
                />
              </div>
              <span className="hidden text-sm font-semibold sm:inline">
                Invoice Web
              </span>
            </Link>

            {/* 구분자 */}
            <ChevronRight
              className="text-muted-foreground hidden h-4 w-4 sm:block"
              aria-hidden="true"
            />

            {/* 견적서 목록 네비게이션 링크 */}
            <Link
              href={ROUTES.INVOICES}
              className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none sm:flex"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              견적서
            </Link>
          </div>

          {/* 오른쪽: 사용자 정보 + ThemeToggle + 로그아웃 */}
          <div className="flex items-center gap-2">
            {/* 사용자 정보 (sm 이상에서 표시) */}
            <div
              className="hidden items-center gap-2 sm:flex"
              aria-label="로그인 사용자 정보"
            >
              {/* 사용자 아바타 이니셜 */}
              <div
                className="bg-muted flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
                aria-hidden="true"
              >
                {userInitial}
              </div>
              <div className="text-right">
                <p className="text-sm leading-none font-medium">{userName}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {userEmail}
                </p>
              </div>
              {/* 관리자 역할 뱃지 */}
              {userRole === 'admin' && (
                <Badge variant="secondary" className="text-xs">
                  관리자
                </Badge>
              )}
              <Separator orientation="vertical" className="ml-1 h-6" />
            </div>

            {/* 테마 전환 버튼 (Client Component) */}
            <ThemeToggle />

            {/* 로그아웃 버튼 (Client Component) */}
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
