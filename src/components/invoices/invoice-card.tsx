/**
 * 견적서 목록 카드 컴포넌트
 * 목록 페이지에서 견적서 요약 정보를 카드 형태로 표시
 */

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StatusBadge } from '@/components/invoices/status-badge'
import { formatAmount, formatDate } from '@/lib/format-utils'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { CalendarDays, User } from 'lucide-react'
import type { Invoice } from '@/lib/types/invoice'

interface InvoiceCardProps {
  invoice: Omit<Invoice, 'items'>
  className?: string
}

export function InvoiceCard({ invoice, className }: InvoiceCardProps) {
  return (
    <Link
      href={ROUTES.INVOICE_DETAIL(invoice.id)}
      aria-label={`${invoice.customerName} 견적서 ${invoice.invoiceNumber} 상세 보기`}
      className="group focus-visible:ring-ring block focus-visible:rounded-lg focus-visible:ring-2 focus-visible:outline-none"
    >
      <Card
        className={cn(
          /* 기본 카드 스타일 */
          'cursor-pointer',
          /* 호버/포커스 인터랙션 */
          'transition-all duration-200',
          'hover:-translate-y-0.5 hover:shadow-md',
          'group-focus-visible:shadow-md',
          className
        )}
      >
        <CardHeader className="pb-3">
          {/* 견적서 번호 + 상태 배지 */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {/* 견적서 번호 */}
              <p className="truncate text-base leading-tight font-semibold">
                {invoice.invoiceNumber}
              </p>
              {/* 고객사명 */}
              <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{invoice.customerName}</span>
              </p>
            </div>
            {/* 상태 배지 */}
            <StatusBadge status={invoice.status} />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* 구분선 */}
          <div className="mb-3 border-t" />

          {/* 메타 정보 */}
          <dl className="space-y-1.5">
            {/* 작성일 */}
            <div className="flex items-center justify-between text-sm">
              <dt className="text-muted-foreground flex items-center gap-1.5">
                <CalendarDays
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                작성일
              </dt>
              <dd>{formatDate(invoice.createdDate)}</dd>
            </div>

            {/* 유효기간 */}
            <div className="flex items-center justify-between text-sm">
              <dt className="text-muted-foreground">유효기간</dt>
              <dd className="text-muted-foreground">
                {formatDate(invoice.validUntil)}
              </dd>
            </div>
          </dl>

          {/* 금액 강조 표시 */}
          <div className="bg-muted/50 mt-3 flex items-center justify-between rounded-md px-3 py-2">
            <span className="text-muted-foreground text-sm font-medium">
              총 금액
            </span>
            <span className="text-base font-bold">
              {formatAmount(invoice.totalAmount)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
