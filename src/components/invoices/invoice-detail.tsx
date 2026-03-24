/**
 * 견적서 상세 정보 컴포넌트
 * 견적서의 전체 정보를 섹션별 카드로 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/invoices/status-badge'
import { formatAmount, formatDate } from '@/lib/format-utils'
import {
  Building2,
  Phone,
  Mail,
  User,
  CalendarDays,
  CalendarCheck,
} from 'lucide-react'
import type { Invoice } from '@/lib/types/invoice'

interface InvoiceDetailProps {
  invoice: Invoice
}

/** 정보 항목 컴포넌트 (라벨 + 값 쌍) */
function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="space-y-1">
      <dt className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
        {label}
      </dt>
      <dd className="text-sm font-medium">{value || '-'}</dd>
    </div>
  )
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  // Items 배열에서 합계 계산 (DB 값이 없을 때 폴백)
  const total =
    invoice.items.length > 0
      ? invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0)
      : invoice.totalAmount

  return (
    <div className="space-y-5">
      {/* 상단 헤더 섹션: 견적서 번호 + 상태 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                {invoice.invoiceNumber}
              </CardTitle>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                {invoice.customerName}
              </p>
            </div>
            {/* 상태 배지 */}
            <div className="self-start">
              <StatusBadge status={invoice.status} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 고객 정보 섹션 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2
              className="text-muted-foreground h-4 w-4"
              aria-hidden="true"
            />
            고객 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 모바일: 1컬럼 / 태블릿 이상: 2컬럼 */}
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem
              icon={Building2}
              label="회사명"
              value={invoice.customerName}
            />
            <InfoItem
              icon={Mail}
              label="이메일"
              value={invoice.customerEmail || '미등록'}
            />
            <InfoItem
              icon={Phone}
              label="연락처"
              value={invoice.customerPhone}
            />
          </dl>
        </CardContent>
      </Card>

      {/* 담당 직원 정보 섹션 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User
              className="text-muted-foreground h-4 w-4"
              aria-hidden="true"
            />
            담당 직원 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 모바일: 1컬럼 / 태블릿 이상: 3컬럼 */}
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InfoItem
              icon={User}
              label="담당자명"
              value={invoice.managerName}
            />
            <InfoItem
              icon={Mail}
              label="이메일"
              value={invoice.managerEmail || '미등록'}
            />
            <InfoItem
              icon={Phone}
              label="연락처"
              value={invoice.managerPhone || '미등록'}
            />
          </dl>
        </CardContent>
      </Card>

      {/* 견적 기간 섹션 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays
              className="text-muted-foreground h-4 w-4"
              aria-hidden="true"
            />
            견적 기간
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 모바일: 1컬럼 / 태블릿 이상: 2컬럼 */}
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem
              icon={CalendarDays}
              label="작성 날짜"
              value={formatDate(invoice.createdDate)}
            />
            <InfoItem
              icon={CalendarCheck}
              label="유효 기간"
              value={formatDate(invoice.validUntil)}
            />
          </dl>
        </CardContent>
      </Card>

      {/* 견적 항목 테이블 섹션 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">견적 항목</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* 모바일에서 가로 스크롤 허용 */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">품명</TableHead>
                  <TableHead className="text-right">수량</TableHead>
                  <TableHead className="text-right">단가</TableHead>
                  <TableHead className="pr-6 text-right">금액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* 항목 행 */}
                {invoice.items.map(item => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell className="pl-6 font-medium">
                      <div>{item.itemName}</div>
                      {/* 품명 설명 (선택 사항) */}
                      {item.description && (
                        <div className="text-muted-foreground mt-0.5 text-xs">
                          {item.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatAmount(item.unitPrice)}
                    </TableCell>
                    <TableCell className="pr-6 text-right tabular-nums">
                      {formatAmount(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* 합계 행 */}
                <TableRow className="bg-muted/40 border-t-2 font-semibold">
                  <TableCell colSpan={3} className="pl-6 text-right text-sm">
                    합계
                  </TableCell>
                  <TableCell className="pr-6 text-right text-base font-bold tabular-nums">
                    {formatAmount(total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 비고 / 특수 요청사항 (선택적 표시) */}
      {invoice.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">특수 요청사항 / 비고</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
