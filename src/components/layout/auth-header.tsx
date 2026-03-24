/**
 * 인증 영역(auth) 전용 헤더
 * 사이드바가 로고/네비게이션을 담당하므로, 헤더는 사용자 정보 및 액션 버튼 표시
 * Server Component에서 세션을 읽고 LogoutButton, ThemeToggle만 Client Component로 분리
 */

import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/layout/logout-button'
import { ThemeToggle } from '@/components/theme-toggle'
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
      <div className="px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* 왼쪽: 모바일 전용 서비스명 (md 미만에서만 표시, 사이드바가 없는 화면) */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-sm font-semibold">Invoice Web</span>
          </div>

          {/* md 이상에서 왼쪽 영역은 비움 (사이드바가 로고/네비게이션 담당) */}
          <div className="hidden md:block" aria-hidden="true" />

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
