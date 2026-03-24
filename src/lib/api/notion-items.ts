/* eslint-disable @typescript-eslint/no-explicit-any */

import { env } from '@/lib/env'
import {
  queryNotionDatabase,
  extractText,
  extractNumber,
} from './notion-client'

/**
 * 특정 견적서의 항목들을 Notion Items 데이터베이스에서 조회합니다.
 *
 * 주의: 현재 Items DB와 Invoices DB 간의 관계 필드를 통한 필터링이
 * 미구현 상태입니다. 관계 필드명 확인 후 아래 TODO를 완성해주세요.
 *
 * @param invoiceId 견적서 Notion Page ID (현재 필터에 미사용 - TODO 참조)
 * @returns 항목 배열
 */
export async function fetchInvoiceItems(invoiceId: string): Promise<any[]> {
  // invoiceId가 아직 필터에 사용되지 않음을 명시 (lint 방지)
  void invoiceId

  try {
    // Items DB가 설정되지 않으면 빈 배열 반환
    if (!env.NOTION_ITEMS_DATABASE_ID) {
      console.warn(
        'NOTION_ITEMS_DATABASE_ID가 설정되지 않았습니다. 항목 데이터 없이 진행합니다.'
      )
      return []
    }

    // TODO: Items와 Invoices의 관계 필드명 확인 후 아래 필터를 추가하세요.
    // 예시:
    // const filter = {
    //   property: '견적서',  // 관계 필드명
    //   relation: { contains: invoiceId },
    // }
    // 현재는 필터 없이 모든 items를 조회합니다.
    // 항목 조회: 24시간(86400초) 캐시 적용
    const results = await queryNotionDatabase(
      env.NOTION_ITEMS_DATABASE_ID,
      undefined,
      [{ property: '순서', direction: 'ascending' }],
      86400
    )

    // 각 항목을 객체로 변환 (CSV 필드명 기반)
    const items = results.map((page: any) => {
      // 🔍 디버깅: 실제 필드명 확인
      console.log(
        '[fetchInvoiceItems] 항목 필드 목록:',
        Object.keys(page.properties)
      )

      const quantity = extractNumber(
        page.properties['수량'] || page.properties['quantity']
      )
      const unitPrice = extractNumber(
        page.properties['단가'] || page.properties['unitPrice']
      )
      const amountFromDB = extractNumber(
        page.properties['금액'] || page.properties['amount']
      )
      const calculatedAmount = quantity * unitPrice

      // 🔍 품명 필드 디버깅
      const itemNameField =
        page.properties['품명'] ||
        page.properties['품명/서비스명'] ||
        page.properties['itemName'] ||
        page.properties['item_name']
      const itemNameValue = extractText(itemNameField)
      console.log('[fetchInvoiceItems] 품명:', itemNameValue)

      return {
        id: page.id,
        itemName: itemNameValue,
        description: extractText(
          page.properties['상세 설명'] ||
            page.properties['설명'] ||
            page.properties['description']
        ),
        quantity,
        unitPrice,
        // DB 금액이 없으면 수량 × 단가로 계산
        amount: calculatedAmount || amountFromDB,
      }
    })

    return items
  } catch (error) {
    // Items DB 미설정이나 쿼리 오류는 빈 배열로 무시
    console.warn(`항목 조회 실패 (invoiceId: ${invoiceId}):`, error)
    return []
  }
}
