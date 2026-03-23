/* eslint-disable @typescript-eslint/no-explicit-any */

import { getNotionClient } from './notion-client'
import { env } from '@/lib/env'

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

    const client = getNotionClient()

    // Relation 필드로 해당 견적서의 항목만 필터링 (dataSources.query 사용)
    const response = await (client.dataSources.query as any)({
      data_source_id: env.NOTION_ITEMS_DATABASE_ID,
      filter: {
        property: '견적서', // Relation 필드명 - Notion DB에 맞게 수정 필요
        relation: {
          contains: invoiceId,
        },
      },
      sorts: [
        {
          property: '순서', // 또는 created_time
          direction: 'ascending',
        },
      ],
    })

    // 각 항목을 객체로 변환
    const items = response.results.map((page: any) => ({
      id: page.id,
      description: extractText(page.properties['설명'] || page.properties['description']),
      quantity: extractNumber(page.properties['수량'] || page.properties['quantity']),
      unitPrice: extractNumber(page.properties['단가'] || page.properties['unitPrice']),
      amount: extractNumber(page.properties['금액'] || page.properties['amount']),
    }))

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
