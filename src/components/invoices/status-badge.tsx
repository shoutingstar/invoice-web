/**
 * 견적서 상태 배지 컴포넌트
 * STATUS_STYLE_MAP을 사용하여 상태별 색상과 아이콘을 표시
 */

import { cn } from '@/lib/utils'
import { STATUS_STYLE_MAP } from '@/lib/constants'
import { Clock, CheckCircle2, Send, FileEdit } from 'lucide-react'
import type { InvoiceStatus } from '@/lib/types/invoice'

interface StatusBadgeProps {
  status: InvoiceStatus
  className?: string
  /** 아이콘 표시 여부 (기본값: true) */
  showIcon?: boolean
}

/** 상태별 아이콘 매핑 */
const STATUS_ICON_MAP: Record<
  InvoiceStatus,
  React.ComponentType<{ className?: string }>
> = {
  대기: Clock,
  승인완료: CheckCircle2,
  발송완료: Send,
  작성중: FileEdit,
}

export function StatusBadge({
  status,
  className,
  showIcon = true,
}: StatusBadgeProps) {
  const style = STATUS_STYLE_MAP[status]
  const Icon = STATUS_ICON_MAP[status]

  return (
    <span
      role="status"
      aria-label={`견적서 상태: ${style.label}`}
      className={cn(
        /* 기본 배지 스타일 */
        'inline-flex items-center gap-1.5',
        'rounded-full border px-2.5 py-0.5',
        'text-xs font-medium',
        'whitespace-nowrap',
        /* 상태별 색상 */
        style.bgColor,
        style.textColor,
        style.borderColor,
        className
      )}
    >
      {/* 상태 아이콘 */}
      {showIcon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      {style.label}
    </span>
  )
}
