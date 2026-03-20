/**
 * 앱 전체에서 사용하는 상수 정의
 */

import type { InvoiceStatus } from '@/lib/types/invoice';

// 경로 상수
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  INVOICES: '/invoices',
  INVOICE_DETAIL: (id: string) => `/invoices/${id}`,
} as const;

// 페이지네이션
export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
  MAX_PAGES: 5,
} as const;

// 견적서 상태와 UI 바리언트 매핑
type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export const STATUS_VARIANT_MAP: Record<InvoiceStatus, StatusVariant> = {
  '대기': 'outline',
  '승인완료': 'default',
  '발송완료': 'secondary',
  '작성중': 'destructive',
} as const;

// 상태별 표시 텍스트 및 색상 (Tailwind)
export const STATUS_STYLE_MAP: Record<InvoiceStatus, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
  '대기': {
    label: '대기',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-900 dark:text-yellow-100',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  '승인완료': {
    label: '승인완료',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-900 dark:text-green-100',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  '발송완료': {
    label: '발송완료',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-900 dark:text-blue-100',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  '작성중': {
    label: '작성중',
    bgColor: 'bg-gray-50 dark:bg-gray-900',
    textColor: 'text-gray-900 dark:text-gray-100',
    borderColor: 'border-gray-200 dark:border-gray-800',
  },
} as const;
