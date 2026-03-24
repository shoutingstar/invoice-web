/* eslint-disable @typescript-eslint/no-explicit-any */

import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { Invoice, InvoiceStatus, InvoiceItem } from '@/lib/types/invoice'
import { extractText as extractTextFromClient } from './notion-client'

// Notion 상태값 → 앱 상태값 매핑 (CSV 기반 한글 상태값 사용)
const NOTION_STATUS_MAP: Record<string, InvoiceStatus> = {
  // 한글 상태값 (현재 CSV 기반 가정)
  대기: '대기',
  승인완료: '승인완료',
  발송완료: '발송완료',
  작성중: '작성중',
  // 영문 상태값 (Notion API가 영문을 반환할 경우)
  Pending: '대기',
  Approved: '승인완료',
  Sent: '발송완료',
  Draft: '작성중',
}

/**
 * Notion 페이지 객체를 Invoice 타입으로 변환합니다.
 * @param page Notion 페이지 객체
 * @param items 해당 견적서의 항목들 (optional)
 * @returns Invoice 객체
 */
export function mapNotionPageToInvoice(
  page: PageObjectResponse,
  notionItems: any[] = []
): Invoice {
  const properties = page.properties as Record<string, any>

  // 각 필드 추출 (CSV 필드명 기반) - 공통 extractText 사용
  const invoiceNumber = extractTextFromClient(
    properties['견적 번호'] || properties['invoiceNumber']
  )
  const customerName = extractTextFromClient(
    properties['고객사명'] || properties['customerName']
  )
  const customerPhone = extractTextFromClient(
    properties['고객 연락처'] || properties['customerPhone']
  )
  const customerEmail =
    extractTextFromClient(
      properties['고객 이메일'] || properties['customerEmail']
    ) || ''
  const statusRaw = extractTextFromClient(
    properties['상태'] || properties['status']
  )
  const amountRaw = extractTextFromClient(
    properties['합계 금액'] || properties['totalAmount']
  )
  const createdDateRaw = extractDate(
    properties['작성 날짜'] || properties['createdDate']
  )
  const validUntilRaw = extractDate(
    properties['유효기간'] || properties['validUntil']
  )
  const managerName = extractTextFromClient(
    properties['담당자명'] || properties['managerName']
  )
  const managerEmail =
    extractTextFromClient(
      properties['담당자 이메일'] || properties['managerEmail']
    ) || ''
  const managerPhone =
    extractTextFromClient(
      properties['담당자 연락처'] || properties['managerPhone']
    ) || ''
  const notes =
    extractTextFromClient(
      properties['특수 요청사항/비고'] || properties['notes']
    ) || ''

  // 상태값 변환 (매퍼 사용)
  const status: InvoiceStatus =
    NOTION_STATUS_MAP[statusRaw] || ('대기' as InvoiceStatus)

  // 금액 파싱 (₩5,000,000 → 5000000)
  const totalAmount = parseAmount(amountRaw)

  // Notion Items를 InvoiceItem[]로 변환
  const items: InvoiceItem[] = notionItems.map((item, index) => ({
    id: item.id || `item-${index}`,
    order: index + 1, // CSV의 순서는 1부터 시작
    itemName: item.itemName || 'N/A',
    quantity: item.quantity || 0,
    unitPrice: item.unitPrice || 0,
    amount: item.amount || 0,
    description: item.description || '',
  }))

  // 날짜 처리
  const createdDate = createdDateRaw || new Date().toISOString().split('T')[0]
  const validUntil =
    validUntilRaw ||
    (() => {
      const date = new Date(createdDate)
      date.setDate(date.getDate() + 30)
      return date.toISOString().split('T')[0]
    })()

  return {
    id: page.id,
    invoiceNumber: invoiceNumber || 'N/A',
    customerName: customerName || 'N/A',
    customerPhone: customerPhone || 'N/A',
    customerEmail,
    createdDate,
    validUntil,
    status,
    totalAmount,
    managerName: managerName || '담당자',
    managerEmail,
    managerPhone,
    notes,
    items,
  }
}

/**
 * 한글 날짜 문자열을 ISO 형식으로 변환합니다.
 * 예: "2026년 3월 20일" → "2026-03-20"
 */
function parseKoreanDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0]

  // "YYYY년 M월 DD일" 형식 파싱
  const match = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/)
  if (match) {
    const [, year, month, day] = match
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return new Date().toISOString().split('T')[0]
}

/**
 * Notion 날짜 필드에서 날짜를 추출합니다.
 * date 타입 또는 rich_text 타입 모두 지원
 */
function extractDate(property: any): string {
  if (!property) return new Date().toISOString().split('T')[0]

  // date 타입
  if (property.type === 'date' && property.date?.start) {
    return property.date.start
  }

  // rich_text 타입 (한글 날짜)
  if (property.type === 'rich_text' || property.type === 'formula') {
    const text = extractTextFromClient(property)
    if (text) {
      return parseKoreanDate(text)
    }
  }

  return new Date().toISOString().split('T')[0]
}

/**
 * 금액 문자열(예: "₩5,000,000")을 숫자로 파싱합니다.
 */
function parseAmount(amountStr: string): number {
  if (!amountStr && amountStr !== '0') return 0

  // 문자열이 아닌 경우 (number 타입이면 그대로 반환)
  if (typeof amountStr === 'number') return amountStr

  // 숫자와 쉼표만 추출
  const cleaned = String(amountStr).replace(/[^0-9]/g, '')
  return parseInt(cleaned, 10) || 0
}

/**
 * Status 매퍼 노출 (필요하면 다른 곳에서도 사용 가능)
 */
export function normalizeStatus(status: string): InvoiceStatus {
  return NOTION_STATUS_MAP[status] || ('대기' as InvoiceStatus)
}
