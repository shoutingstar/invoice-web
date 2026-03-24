/**
 * 좌측 고정 사이드바 컴포넌트 (Server Component)
 * NextAuth 세션에서 사용자 역할을 읽어 관리자 메뉴를 조건부 렌더링
 */

import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { auth } from '@/auth'
import { ROUTES } from '@/lib/constants'
import { SidebarNav } from '@/components/layout/sidebar-nav'

export async function Sidebar() {
  const session = await auth()
  const userRole = session?.user?.role ?? 'user'
  const isAdmin = userRole === 'admin'

  return (
    <aside
      className="bg-background border-border hidden w-64 shrink-0 flex-col border-r md:flex print:hidden"
      aria-label="사이드바 네비게이션"
    >
      {/* 로고 영역 */}
      <div className="border-border flex h-14 items-center border-b px-4">
        <Link
          href={ROUTES.DASHBOARD}
          className="hover:bg-accent focus-visible:ring-ring flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          aria-label="대시보드로 이동"
        >
          {/* 로고 아이콘 */}
          <div
            className="bg-primary flex h-7 w-7 items-center justify-center rounded-md"
            aria-hidden="true"
          >
            <LayoutDashboard className="text-primary-foreground h-4 w-4" />
          </div>
          {/* 서비스 이름 */}
          <span className="text-sm font-semibold">Invoice Web</span>
        </Link>
      </div>

      {/* 네비게이션 메뉴 (Client Component) */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav isAdmin={isAdmin} />
      </div>
    </aside>
  )
}
