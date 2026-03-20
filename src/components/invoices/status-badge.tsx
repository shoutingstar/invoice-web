/**
 * 견적서 상태 배지 컴포넌트
 */

import { Badge } from '@/components/ui/badge';
import { getStatusVariant, getStatusLabel } from '@/lib/format-utils';
import type { InvoiceStatus } from '@/lib/types/invoice';

interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = getStatusVariant(status);
  const label = getStatusLabel(status);

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
