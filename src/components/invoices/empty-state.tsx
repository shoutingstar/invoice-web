/**
 * 빈 목록 상태 컴포넌트
 * 데이터가 없거나 검색 결과가 없을 때 표시하는 안내 UI
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; href: string }
  icon?: ReactNode
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-label={title}
      className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16"
    >
      {/* 아이콘 영역: 원형 배경으로 강조 */}
      <div className="bg-muted mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <div className="text-muted-foreground" aria-hidden="true">
          {icon ?? <FileQuestion className="h-10 w-10" />}
        </div>
      </div>

      {/* 제목 */}
      <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>

      {/* 설명 텍스트 (선택 사항) */}
      {description && (
        <p className="text-muted-foreground mb-8 max-w-xs text-center text-sm leading-relaxed">
          {description}
        </p>
      )}

      {/* CTA 버튼 (선택 사항) */}
      {action && (
        <Link href={action.href}>
          {/* TODO: 접근성 - 버튼 목적이 명확하도록 aria-label 추가 고려 */}
          <Button variant="default" size="sm">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  )
}
