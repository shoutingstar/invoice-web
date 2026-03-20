/**
 * 견적서 상세 정보 컴포넌트
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/invoices/status-badge';
import { formatAmount, formatDate } from '@/lib/format-utils';
import type { Invoice } from '@/lib/types/invoice';

interface InvoiceDetailProps {
  invoice: Invoice;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const total = invoice.totalAmount;

  return (
    <div className="space-y-6">
      {/* 상단 정보 섹션 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{invoice.invoiceNumber}</CardTitle>
              <CardDescription className="mt-2">{invoice.customerName}</CardDescription>
            </div>
            <StatusBadge status={invoice.status} />
          </div>
        </CardHeader>
      </Card>

      {/* 고객 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">고객 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">회사명</div>
              <div className="font-medium">{invoice.customerName}</div>
            </div>
            <div>
              <div className="text-muted-foreground">담당자</div>
              <div className="font-medium">{invoice.managerName}</div>
            </div>
            <div>
              <div className="text-muted-foreground">이메일</div>
              <div className="font-medium">{invoice.customerEmail}</div>
            </div>
            <div>
              <div className="text-muted-foreground">연락처</div>
              <div className="font-medium">{invoice.customerPhone}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 담당자 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">담당자 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">담당자명</div>
              <div className="font-medium">{invoice.managerName}</div>
            </div>
            <div>
              <div className="text-muted-foreground">이메일</div>
              <div className="font-medium">{invoice.managerEmail}</div>
            </div>
            <div>
              <div className="text-muted-foreground">연락처</div>
              <div className="font-medium">{invoice.managerPhone}</div>
            </div>
            <div>
              <div className="text-muted-foreground">작성일</div>
              <div className="font-medium">{formatDate(invoice.createdDate)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 견적 기간 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">견적 기간</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-muted-foreground">작성 날짜</div>
              <div className="font-medium">{formatDate(invoice.createdDate)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">유효 기간</div>
              <div className="font-medium">{formatDate(invoice.validUntil)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 항목 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">견적 항목</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>품명</TableHead>
                <TableHead className="text-right">수량</TableHead>
                <TableHead className="text-right">단가</TableHead>
                <TableHead className="text-right">금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>{item.itemName}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatAmount(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatAmount(item.amount)}</TableCell>
                </TableRow>
              ))}
              {/* 합계 행 */}
              <TableRow className="border-t-2 bg-muted/50">
                <TableCell colSpan={3} className="text-right font-semibold">
                  합계
                </TableCell>
                <TableCell className="text-right font-bold">{formatAmount(total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 비고 */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">특수 요청사항 / 비고</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
