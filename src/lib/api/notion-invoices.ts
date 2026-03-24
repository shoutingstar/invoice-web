/* eslint-disable @typescript-eslint/no-explicit-any */

import { mapNotionPageToInvoice } from './notion-mapper'
import { fetchInvoiceItems } from './notion-items'
import { Invoice, InvoiceStatus } from '@/lib/types/invoice'
import { InvoiceListResult } from '@/lib/types/api'
import { env } from '@/lib/env'
import { getMockInvoices, getInvoiceStats } from '@/lib/mock-data'

/**
 * Notion ID를 정규화합니다 (하이픈 없음 → 하이픈 있음)
 * 예: 3290c1003d2e80e2a7b3d8ad3c344811 → 3290c100-3d2e-80e2-a7b3-d8ad3c344811
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
  console.log('🔍 Notion API 요청:', {
    original: databaseId,
    normalized: normalizedId,
    url: `https://api.notion.com/v1/databases/${normalizedId}/query`,
  })
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
 * 모든 견적서를 조회합니다.
 * MVP 규모이므로 전체 조회 후 앱에서 필터링/페이지네이션합니다.
 */
export async function fetchInvoices(options?: {
  search?: string
  status?: InvoiceStatus | ''
  page?: number
  limit?: number
}): Promise<InvoiceListResult> {
  const { search = '', status = '', page = 1, limit = 10 } = options || {}

  try {
    if (!env.NOTION_DATABASE_ID) {
      throw new Error('NOTION_DATABASE_ID 환경변수가 설정되지 않았습니다.')
    }

    // Notion 필터 구성
    const filters: any[] = []

    // 상태 필터 (select 또는 rich_text로 처리)
    if (status) {
      filters.push({
        property: '상태',
        rich_text: {
          contains: status,
        },
      })
    }

    // 검색 필터 (고객사명 또는 견적 번호)
    if (search) {
      filters.push({
        or: [
          {
            property: '고객사명',
            rich_text: {
              contains: search,
            },
          },
          {
            property: '견적 번호',
            title: {
              contains: search,
            },
          },
        ],
      })
    }

    // 데이터베이스 쿼리
    const results = await queryNotionDatabase(
      env.NOTION_DATABASE_ID,
      filters.length === 1
        ? filters[0]
        : filters.length > 1
          ? { and: filters }
          : undefined,
      [
        {
          property: '작성 날짜',
          direction: 'descending',
        },
      ]
    )

    // 각 페이지에 대해 항목들을 병렬 조회
    const invoices = await Promise.all(
      results.map(async (page: any) => {
        try {
          const items = await fetchInvoiceItems(page.id)
          return mapNotionPageToInvoice(page, items)
        } catch (error) {
          // 항목 조회 실패는 무시하고 빈 배열로 처리
          console.warn(`Failed to fetch items for invoice ${page.id}:`, error)
          return mapNotionPageToInvoice(page, [])
        }
      })
    )

    // 앱에서 페이지네이션 (심플함)
    const startIdx = (page - 1) * limit
    const endIdx = startIdx + limit
    const paginatedInvoices = invoices.slice(startIdx, endIdx)

    return {
      invoices: paginatedInvoices,
      total: invoices.length,
      page,
      limit,
      hasMore: endIdx < invoices.length,
      nextCursor: endIdx < invoices.length ? String(page + 1) : undefined,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Failed to fetch invoices from Notion:', {
      error: errorMessage,
      databaseId: env.NOTION_DATABASE_ID,
      hasApiKey: !!env.NOTION_API_KEY,
    })

    // Notion API 실패 시 Mock 데이터로 페일오버
    console.log('📊 Mock 데이터로 페일오버됨')
    const mockInvoices = getMockInvoices()

    // 검색/필터 적용
    let filtered = mockInvoices
    if (status) {
      filtered = filtered.filter(inv => inv.status === status)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        inv =>
          inv.invoiceNumber.toLowerCase().includes(searchLower) ||
          inv.customerName.toLowerCase().includes(searchLower)
      )
    }

    // 페이지네이션
    const startIdx = (page - 1) * limit
    const endIdx = startIdx + limit
    const paginatedInvoices = filtered.slice(startIdx, endIdx)

    return {
      invoices: paginatedInvoices,
      total: filtered.length,
      page,
      limit,
      hasMore: endIdx < filtered.length,
      nextCursor: endIdx < filtered.length ? String(page + 1) : undefined,
    }
  }
}

/**
 * 특정 ID의 견적서를 조회합니다.
 */
export async function fetchInvoiceById(id: string): Promise<Invoice | null> {
  try {
    if (!env.NOTION_API_KEY) {
      throw new Error('NOTION_API_KEY 환경변수가 설정되지 않았습니다.')
    }

    // Notion 페이지 조회
    const response = await fetch('https://api.notion.com/v1/pages/' + id, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + env.NOTION_API_KEY,
        'Notion-Version': '2022-06-28',
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch page ${id}: ${response.status}`)
      // Mock 데이터로 페일오버
      const mockInvoices = getMockInvoices()
      return mockInvoices.find(inv => inv.id === id) || null
    }

    const page = await response.json()

    // 항목들 조회
    const items = await fetchInvoiceItems(id)

    return mapNotionPageToInvoice(page, items)
  } catch (error) {
    // 404 또는 권한 오류
    console.error(`Failed to fetch invoice ${id}:`, error)
    // Mock 데이터로 페일오버
    const mockInvoices = getMockInvoices()
    return mockInvoices.find(inv => inv.id === id) || null
  }
}

/**
 * 견적서 통계를 조회합니다.
 * - 전체 견적서 수
 * - 상태별 개수 (대기, 승인완료, 발송완료, 작성중)
 */
export async function fetchInvoiceStats(): Promise<{
  total: number
  byStatus: Record<InvoiceStatus, number>
}> {
  try {
    const result = await fetchInvoices({ limit: 1000 })

    const stats = {
      total: result.total,
      byStatus: {
        대기: 0,
        승인완료: 0,
        발송완료: 0,
        작성중: 0,
      } as Record<InvoiceStatus, number>,
    }

    // 상태별 집계
    result.invoices.forEach((invoice: Invoice) => {
      const status = invoice.status as InvoiceStatus
      stats.byStatus[status]++
    })

    return stats
  } catch (error) {
    console.error('Failed to fetch invoice stats:', error)
    return {
      total: 0,
      byStatus: {
        대기: 0,
        승인완료: 0,
        발송완료: 0,
        작성중: 0,
      },
    }
  }
}
