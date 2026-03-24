import { AuthHeader } from '@/components/layout/auth-header'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 스킵 네비게이션: 키보드/스크린리더 사용자가 헤더를 건너뛰고 본문으로 바로 이동 */}
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:outline-none"
      >
        본문으로 바로가기
      </a>
      <AuthHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
    </div>
  )
}
