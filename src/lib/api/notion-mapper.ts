/* eslint-disable @typescript-eslint/no-explicit-any */

import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { Invoice, InvoiceStatus, InvoiceItem } from '@/lib/types/invoice'

// Notion 상태값 → 앱 상태값 매핑
// TODO(human): Notion DB에서 실제 상태값 확인 후 이 맵을 업데이트하세요
// 예: DB에서 "Pending" vs "대기" 중 어느 것을 사용하는지 확인
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

  // 각 필드 추출
  const invoiceNumber = extractText(properties['견적 번호'] || properties['invoiceNumber'])
  const customerName = extractText(properties['고객사명'] || properties['customerName'])
  const customerPhone = extractText(properties['고객 연락처'] || properties['customerPhone'])
  const customerEmail = extractText(properties['고객 이메일'] || properties['customerEmail']) || ''
  const statusRaw = extractText(properties['상태'] || properties['status'])
  const amountRaw = extractText(properties['합계 금액'] || properties['totalAmount'])
  const createdDateRaw = extractDate(properties['작성일'] || properties['createdDate'])

  // 상태값 변환 (매퍼 사용)
  const status: InvoiceStatus = NOTION_STATUS_MAP[statusRaw] || ('대기' as InvoiceStatus)

  // 금액 파싱 (₩5,000,000 → 5000000)
  const totalAmount = parseAmount(amountRaw)

  // Notion Items를 InvoiceItem[]로 변환
  const items: InvoiceItem[] = notionItems.map((item, index) => ({
    id: item.id || `item-${index}`,
    order: index,
    itemName: item.description || item.itemName || 'N/A',
    quantity: item.quantity || 0,
    unitPrice: item.unitPrice || 0,
    amount: item.amount || 0,
    description: item.description,
  }))

  // 유효기간 (기본값: 생성일로부터 30일)
  const createdDate = createdDateRaw || new Date().toISOString().split('T')[0]
  const validUntilDate = new Date(createdDate)
  validUntilDate.setDate(validUntilDate.getDate() + 30)
  const validUntil = validUntilDate.toISOString().split('T')[0]

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
    managerName: '담당자', // TODO: Notion에서 추출 또는 세션에서 가져오기
    managerEmail: '', // TODO: Notion에서 추출 또는 세션에서 가져오기
    managerPhone: '', // TODO: Notion에서 추출 또는 세션에서 가져오기
    items,
  }
}

/**
 * Notion 텍스트 필드에서 값을 추출합니다.
 */
function extractText(property: any): string {
  if (!property) return ''

  if (property.type === 'title' && property.title?.[0]) {
    return property.title[0].plain_text || ''
  }

  if (property.type === 'rich_text' && property.rich_text?.[0]) {
    return property.rich_text[0].plain_text || ''
  }

  if (property.type === 'select' && property.select?.name) {
    return property.select.name
  }

  return ''
}

/**
 * Notion 날짜 필드에서 날짜를 추출합니다.
 */
function extractDate(property: any): string {
  if (!property) return new Date().toISOString().split('T')[0]

  if (property.type === 'date' && property.date?.start) {
    return property.date.start
  }

  return new Date().toISOString().split('T')[0]
}

/**
 * 금액 문자열(예: "₩5,000,000")을 숫자로 파싱합니다.
 */
function parseAmount(amountStr: string): number {
  if (!amountStr) return 0

  // 숫자와 쉼표만 추출
  const cleaned = amountStr.replace(/[^0-9]/g, '')
  return parseInt(cleaned, 10) || 0
}

/**
 * Status 매퍼 노출 (필요하면 다른 곳에서도 사용 가능)
 */
export function normalizeStatus(status: string): InvoiceStatus {
  return NOTION_STATUS_MAP[status] || ('대기' as InvoiceStatus)
}
