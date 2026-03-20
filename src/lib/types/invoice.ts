/**
 * 견적서 관련 타입 정의
 * Notion CSV 실제 상태값 그대로 사용하여 Phase 3 API 연동 시 변환 최소화
 */

export type InvoiceStatus = '대기' | '승인완료' | '발송완료' | '작성중'

export interface InvoiceItem {
  id: string
  order: number // 표시 순서
  itemName: string
  quantity: number
  unitPrice: number
  amount: number
  description?: string
}

export interface Invoice {
  id: string // Notion 페이지 ID
  invoiceNumber: string // "INV-2026-001"
  customerName: string
  customerPhone: string
  customerEmail: string
  createdDate: string // ISO 형식 "2026-03-20"
  validUntil: string // ISO 형식
  status: InvoiceStatus
  totalAmount: number // 파싱 후 숫자형 (5000000)
  managerName: string
  managerEmail: string
  managerPhone: string
  notes?: string
  items: InvoiceItem[]
}
