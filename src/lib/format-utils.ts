/**
 * 숫자, 날짜, 상태 포맷 유틸리티 함수
 * 앱 전체에서 일관된 포맷 사용
 */

import type { InvoiceStatus } from '@/lib/types/invoice'
import { STATUS_VARIANT_MAP } from '@/lib/constants'

/**
 * 숫자를 한화 금액 형식으로 변환
 * @example formatAmount(5000000) => "₩5,000,000"
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * 한화 금액 문자열을 숫자로 파싱
 * @example parseKoreanAmount("₩5,000,000") => 5000000
 */
export function parseKoreanAmount(amount: string): number {
  // "₩" 기호 제거, 쉼표 제거
  const cleaned = amount.replace(/[₩\s,]/g, '')
  return parseInt(cleaned, 10) || 0
}

/**
 * ISO 날짜를 한국식 날짜로 포맷
 * @example formatDate("2026-03-20") => "2026년 3월 20일"
 */
export function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * 한국식 날짜를 ISO 형식으로 파싱
 * @example parseKoreanDate("2026년 3월 20일") => "2026-03-20"
 */
export function parseKoreanDate(dateString: string): string {
  if (!dateString) return ''

  // "2026년 3월 20일" 형식에서 숫자 추출
  const match = dateString.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/)
  if (!match) return ''

  const [, year, month, day] = match
  const monthNum = String(month).padStart(2, '0')
  const dayNum = String(day).padStart(2, '0')

  return `${year}-${monthNum}-${dayNum}`
}

/**
 * 견적서 상태를 Badge 바리언트로 변환
 */
export function getStatusVariant(
  status: InvoiceStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  return STATUS_VARIANT_MAP[status]
}

/**
 * 상태별 한국식 표시 텍스트 반환
 */
export function getStatusLabel(status: InvoiceStatus): string {
  const labelMap: Record<InvoiceStatus, string> = {
    대기: '대기 중',
    승인완료: '승인 완료',
    발송완료: '발송 완료',
    작성중: '작성 중',
  }
  return labelMap[status] || status
}
