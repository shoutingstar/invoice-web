/* eslint-disable @typescript-eslint/no-explicit-any */

import { Client } from '@notionhq/client'
import { env } from '@/lib/env'

// Notion 클라이언트 싱글톤
let notionClient: Client | null = null

export function getNotionClient(): Client {
  if (!notionClient) {
    if (!env.NOTION_API_KEY) {
      throw new Error(
        'NOTION_API_KEY 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.'
      )
    }

    notionClient = new Client({
      auth: env.NOTION_API_KEY,
    })
  }

  return notionClient
}

/**
 * Notion ID를 정규화합니다 (하이픈 없음 → 하이픈 있음)
 * 예: 3290c1003d2e80e2a7b3d8ad3c344811 → 3290c100-3d2e-80e2-a7b3-d8ad3c344811
 */
export function normalizeNotionId(id: string): string {
  const clean = id.replace(/-/g, '')
  if (clean.length !== 32) return id
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`
}

/**
 * Notion API를 직접 호출하여 데이터베이스를 쿼리합니다.
 * @param databaseId Notion 데이터베이스 ID
 * @param filter Notion 필터 객체
 * @param sorts 정렬 기준 배열
 */
export async function queryNotionDatabase(
  databaseId: string,
  filter?: any,
  sorts?: any[]
): Promise<any[]> {
  if (!env.NOTION_API_KEY) {
    throw new Error('NOTION_API_KEY 환경변수가 설정되지 않았습니다.')
  }

  const normalizedId = normalizeNotionId(databaseId)

  const response = await fetch(
    'https://api.notion.com/v1/databases/' + normalizedId + '/query',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.NOTION_API_KEY,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter,
        sorts,
        page_size: 100,
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(
      `Notion API 에러: ${response.status} - ${errorData.message || '알 수 없는 에러'}`
    )
  }

  const data = await response.json()
  return data.results || []
}

/**
 * Notion 텍스트/타이틀/셀렉트 필드에서 문자열 값을 추출합니다.
 */
export function extractText(property: any): string {
  if (!property) return ''

  // number 타입 (금액 필드가 number일 경우)
  if (property.type === 'number' && property.number !== null) {
    return String(property.number)
  }

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
 * Notion 숫자 필드에서 숫자 값을 추출합니다.
 */
export function extractNumber(property: any): number {
  if (!property) return 0

  if (property.type === 'number' && property.number !== null) {
    return property.number
  }

  // number 타입이 아닐 경우 텍스트에서 파싱
  const text = extractText(property)
  const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10)

  return isNaN(parsed) ? 0 : parsed
}
