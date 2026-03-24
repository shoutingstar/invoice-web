'use client'

/**
 * 사이드바 네비게이션 메뉴 (Client Component)
 * usePathname()으로 현재 경로를 감지하여 활성 메뉴 항목을 표시
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface SidebarNavProps {
  /** 관리자 여부에 따라 관리자 메뉴 조건부 렌더링 */
  isAdmin?: boolean
}

export function SidebarNav({ isAdmin = false }: SidebarNavProps) {
  const pathname = usePathname()

  // 기본 메뉴 항목 목록
  const navItems: NavItem[] = [
    {
      href: ROUTES.DASHBOARD,
      label: '대시보드',
      icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />,
    },
    {
      href: ROUTES.INVOICES,
      label: '견적서',
      icon: <FileText className="h-4 w-4" aria-hidden="true" />,
    },
  ]

  // 관리자 전용 메뉴 항목
  const adminNavItems: NavItem[] = [
    {
      href: '/admin',
      label: '관리자 페이지',
      icon: <ShieldAlert className="h-4 w-4" aria-hidden="true" />,
    },
  ]

  // 현재 경로가 메뉴 항목의 href와 일치하는지 확인 (하위 경로 포함)
  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav aria-label="주요 네비게이션" className="flex flex-col gap-1 px-2">
      {/* 기본 메뉴 */}
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            isActive(item.href)
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          )}
          aria-current={isActive(item.href) ? 'page' : undefined}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}

      {/* 관리자 전용 메뉴 (isAdmin이 true일 때만 렌더링) */}
      {isAdmin && (
        <>
          {/* 구분선 */}
          <div
            className="border-border my-2 border-t"
            role="separator"
            aria-orientation="horizontal"
          />
          <p className="text-muted-foreground mb-1 px-3 text-xs font-semibold tracking-wider uppercase">
            관리자
          </p>
          {adminNavItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                isActive(item.href)
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </>
      )}
    </nav>
  )
}
