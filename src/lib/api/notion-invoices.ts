import { mapNotionPageToInvoice } from './notion-mapper'
import { fetchInvoiceItems } from './notion-items'
import { queryNotionDatabase } from './notion-client'
import { Invoice, InvoiceStatus } from '@/lib/types/invoice'
import { InvoiceListResult } from '@/lib/types/api'
import { env } from '@/lib/env'
import { getMockInvoices } from '@/lib/mock-data'

/**
 * 모든 견적서를 조회합니다.
 * MVP 규모이므로 전체 조회 후 앱에서 필터링/페이지네이션합니다.
 *
 * 주의: 상태 필터는 Notion API 필터 타입 호환 문제로 앱 레벨에서만 처리합니다.
 * (Notion API에서 "database property status does not match filter type" 에러 발생)
 *
 * @param options.includeItems 항목 데이터 포함 여부 (기본값: false, 목록 조회 성능 최적화)
 */
export async function fetchInvoices(options?: {
  search?: string
  status?: InvoiceStatus | ''
  page?: number
  limit?: number
  includeItems?: boolean
}): Promise<InvoiceListResult> {
  const {
    search = '',
    status = '',
    page = 1,
    limit = 10,
    includeItems = false,
  } = options || {}

  try {
    if (!env.NOTION_DATABASE_ID) {
      throw new Error('NOTION_DATABASE_ID 환경변수가 설정되지 않았습니다.')
    }

    // 검색 필터 구성 (고객사명 또는 견적 번호)
    // 상태 필터는 Notion API 호환 문제로 앱 레벨에서 처리
    const filter = search
      ? {
          or: [
            {
              property: '고객사명',
              rich_text: { contains: search },
            },
            {
              property: '견적 번호',
              title: { contains: search },
            },
          ],
        }
      : undefined

    // 목록 조회: 1시간(3600초) 캐시 적용
    const results = await queryNotionDatabase(
      env.NOTION_DATABASE_ID,
      filter,
      [{ property: '작성 날짜', direction: 'descending' }],
      3600
    )

    // 항목 조회 (includeItems가 true일 때만)
    const invoices = await Promise.all(
      results.map(async (page: Record<string, unknown>) => {
        const pageId = (page as { id: string }).id
        try {
          const items = includeItems ? await fetchInvoiceItems(pageId) : []
          return mapNotionPageToInvoice(
            page as Parameters<typeof mapNotionPageToInvoice>[0],
            items
          )
        } catch (error) {
          // 항목 조회 실패는 무시하고 빈 배열로 처리
          console.warn(`Failed to fetch items for invoice ${pageId}:`, error)
          return mapNotionPageToInvoice(
            page as Parameters<typeof mapNotionPageToInvoice>[0],
            []
          )
        }
      })
    )

    // 앱 레벨 상태 필터링
    const filtered = status
      ? invoices.filter(inv => inv.status === status)
      : invoices

    // 앱 레벨 페이지네이션
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
 * 특정 ID의 견적서를 조회합니다. (항목 데이터 포함)
 */
export async function fetchInvoiceById(id: string): Promise<Invoice | null> {
  try {
    if (!env.NOTION_API_KEY) {
      throw new Error('NOTION_API_KEY 환경변수가 설정되지 않았습니다.')
    }

    // Notion 페이지 조회: 24시간(86400초) 캐시 적용 (상세 데이터는 변경 빈도 낮음)
    const response = await fetch('https://api.notion.com/v1/pages/' + id, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + env.NOTION_API_KEY,
        'Notion-Version': '2022-06-28',
      },
      next: { revalidate: 86400, tags: [`notion-invoice-${id}`] },
    })

    if (!response.ok) {
      console.error(`Failed to fetch page ${id}: ${response.status}`)
      // Mock 데이터로 페일오버
      const mockInvoices = getMockInvoices()
      return mockInvoices.find(inv => inv.id === id) || null
    }

    const page = await response.json()

    // 상세 페이지에서는 항목 데이터 포함
    const items = await fetchInvoiceItems(id)

    return mapNotionPageToInvoice(page, items)
  } catch (error) {
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
 *
 * 주의: 통계 조회 시 항목 데이터는 불필요하므로 includeItems: false로 최적화합니다.
 */
export async function fetchInvoiceStats(): Promise<{
  total: number
  byStatus: Record<InvoiceStatus, number>
}> {
  try {
    // 항목 데이터 제외하고 전체 견적서만 조회
    const result = await fetchInvoices({ limit: 1000, includeItems: false })

    const byStatus: Record<InvoiceStatus, number> = {
      대기: 0,
      승인완료: 0,
      발송완료: 0,
      작성중: 0,
    }

    // 상태별 집계
    result.invoices.forEach((invoice: Invoice) => {
      const status = invoice.status as InvoiceStatus
      if (status in byStatus) {
        byStatus[status]++
      }
    })

    return {
      total: result.total,
      byStatus,
    }
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
