/**
 * 견적서 목록 카드 컴포넌트
 */

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/invoices/status-badge';
import { formatAmount, formatDate } from '@/lib/format-utils';
import { ROUTES } from '@/lib/constants';
import type { Invoice } from '@/lib/types/invoice';

interface InvoiceCardProps {
  invoice: Omit<Invoice, 'items'>;
  className?: string;
}

export function InvoiceCard({ invoice, className }: InvoiceCardProps) {
  return (
    <Link href={ROUTES.INVOICE_DETAIL(invoice.id)}>
      <Card className={`cursor-pointer transition-shadow hover:shadow-lg ${className || ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
              <CardDescription className="text-sm">{invoice.customerName}</CardDescription>
            </div>
            <StatusBadge status={invoice.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">작성일</span>
            <span>{formatDate(invoice.createdDate)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span className="text-muted-foreground">금액</span>
            <span>{formatAmount(invoice.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
