import { AuthHeader } from '@/components/layout/auth-header'
import { Sidebar } from '@/components/layout/sidebar'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen">
      {/* 스킵 네비게이션: 키보드/스크린리더 사용자가 사이드바/헤더를 건너뛰고 본문으로 바로 이동 */}
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:outline-none"
      >
        본문으로 바로가기
      </a>

      {/* 좌측 고정 사이드바 (md 이상에서 표시) */}
      <Sidebar />

      {/* 우측 메인 영역: 헤더 + 콘텐츠 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AuthHeader />
        <main id="main-content" className="flex-1 overflow-auto" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
