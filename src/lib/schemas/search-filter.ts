/**
 * 검색 및 필터 Zod 스키마
 */

import { z } from 'zod';
import type { InvoiceStatus } from '@/lib/types/invoice';

export const searchFilterSchema = z.object({
  search: z.string().optional().default(''),
  status: z.enum(['', '대기', '승인완료', '발송완료', '작성중']).optional().default(''),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).default(10),
});

export type SearchFilterFormData = z.infer<typeof searchFilterSchema>;

// UI용 상태 선택지
export const INVOICE_STATUS_OPTIONS: Array<{ value: '' | InvoiceStatus; label: string }> = [
  { value: '', label: '모든 상태' },
  { value: '대기', label: '대기' },
  { value: '승인완료', label: '승인완료' },
  { value: '발송완료', label: '발송완료' },
  { value: '작성중', label: '작성중' },
];
