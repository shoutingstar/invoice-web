/* eslint-disable @typescript-eslint/no-explicit-any */

import { env } from '@/lib/env'

/**
 * Notion ID를 정규화합니다 (하이픈 없음 → 하이픈 있음)
 */
function normalizeNotionId(id: string): string {
  const clean = id.replace(/-/g, '')
  if (clean.length !== 32) return id
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`
}

/**
 * Notion API를 직접 호출하여 데이터베이스를 쿼리합니다.
 */
async function queryNotionDatabase(
  databaseId: string,
  filter?: any,
  sorts?: any[]
): Promise<any[]> {
  if (!env.NOTION_API_KEY) {
    throw new Error('NOTION_API_KEY 환경변수가 설정되지 않았습니다.')
  }

  const normalizedId = normalizeNotionId(databaseId)
  const response = await fetch('https://api.notion.com/v1/databases/' + normalizedId + '/query', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.NOTION_API_KEY,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter,
      sorts,
      page_size: 100,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Notion API 에러: ${response.status} - ${errorData.message || '알 수 없는 에러'}`)
  }

  const data = await response.json()
  return data.results || []
}

/**
 * 특정 견적서의 항목들을 Notion Items 데이터베이스에서 조회합니다.
 * @param invoiceId 견적서 Notion Page ID
 * @returns 항목 배열
 */
export async function fetchInvoiceItems(invoiceId: string): Promise<any[]> {
  try {
    // Items DB가 설정되지 않으면 빈 배열 반환
    if (!env.NOTION_ITEMS_DATABASE_ID) {
      console.warn('NOTION_ITEMS_DATABASE_ID is not configured, skipping items fetch')
      return []
    }

    // TODO(human): Items와 Invoices의 관계 필드명 확인 후 필터 추가
    // 현재는 필터 없이 모든 items 조회 (클라이언트에서 필터링)
    const results = await queryNotionDatabase(
      env.NOTION_ITEMS_DATABASE_ID,
      undefined,
      [
        {
          property: '순서',
          direction: 'ascending',
        },
      ]
    )

    // 각 항목을 객체로 변환 (CSV 필드명 기반)
    const items = results.map((page: any) => {
      const quantity = extractNumber(page.properties['수량'] || page.properties['quantity'])
      const unitPrice = extractNumber(page.properties['단가'] || page.properties['unitPrice'])
      const amountFromDB = extractNumber(page.properties['금액'] || page.properties['amount'])
      const calculatedAmount = quantity * unitPrice

      // 디버깅
      console.log('📦 Item parsing:', {
        itemName: extractText(page.properties['품명/서비스명']),
        quantity,
        unitPrice,
        amountFromDB,
        calculatedAmount,
        unitPriceRaw: page.properties['단가'],
        quantityRaw: page.properties['수량'],
        amountRaw: page.properties['금액'],
      })

      return {
        id: page.id,
        itemName: extractText(
          page.properties['품명/서비스명'] || page.properties['itemName']
        ),
        description: extractText(
          page.properties['상세 설명'] || page.properties['description']
        ),
        quantity,
        unitPrice,
        amount: calculatedAmount || amountFromDB, // DB 값이 없으면 계산값 사용
      }
    })

    return items
  } catch (error) {
    // Items DB 미설정이나 쿼리 오류는 무시
    console.warn(`Failed to fetch items for invoice ${invoiceId}:`, error)
    return []
  }
}

/**
 * Notion 텍스트 필드에서 값을 추출합니다.
 */
function extractText(property: any): string {
  if (!property) return ''

  if (property.type === 'rich_text' && property.rich_text?.[0]) {
    return property.rich_text[0].plain_text || ''
  }

  if (property.type === 'title' && property.title?.[0]) {
    return property.title[0].plain_text || ''
  }

  return ''
}

/**
 * Notion 숫자 필드에서 값을 추출합니다.
 */
function extractNumber(property: any): number {
  if (!property) return 0

  if (property.type === 'number' && property.number !== null) {
    return property.number
  }

  // number 타입이 아닐 경우 텍스트로부터 파싱
  const text = extractText(property)
  const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10)

  return isNaN(parsed) ? 0 : parsed
}
