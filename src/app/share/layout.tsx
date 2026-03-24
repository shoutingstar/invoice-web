/**
 * 공유 링크 전용 레이아웃
 * 인증 불필요, 간소화된 헤더만 표시
 * ThemeProvider는 root layout에서 이미 적용됨
 */

import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 공유 전용 간소화 헤더 */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center">
            {/* 로고 (홈 링크 없이 단순 표시) */}
            <div className="flex items-center gap-2">
              <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-md">
                <LayoutDashboard
                  className="text-primary-foreground h-4 w-4"
                  aria-hidden="true"
                />
              </div>
              <span className="text-sm font-semibold">Invoice Web</span>
            </div>

            {/* 공유 링크 안내 뱃지 */}
            <div className="ml-3">
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                공유된 견적서
              </span>
            </div>

            {/* 오른쪽: 로그인 링크 */}
            <div className="ml-auto">
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1">{children}</main>

      {/* 간소화된 푸터 */}
      <footer className="border-t py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground text-center text-xs">
            이 페이지는 공유된 견적서입니다. 링크 만료 후에는 접근할 수
            없습니다.
          </p>
        </div>
      </footer>
    </div>
  )
}
