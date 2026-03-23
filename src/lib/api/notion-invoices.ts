/* eslint-disable @typescript-eslint/no-explicit-any */

import { getNotionClient } from './notion-client'
import { mapNotionPageToInvoice } from './notion-mapper'
import { fetchInvoiceItems } from './notion-items'
import { Invoice, InvoiceStatus } from '@/lib/types/invoice'
import { InvoiceListResult } from '@/lib/types/api'
import { env } from '@/lib/env'
import type { QueryDataSourceResponse } from '@notionhq/client'

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
    const client = getNotionClient()
    if (!env.NOTION_DATABASE_ID) {
      throw new Error('NOTION_DATABASE_ID 환경변수가 설정되지 않았습니다.')
    }

    // Notion 필터 구성
    const filters: any[] = []

    // 상태 필터
    if (status) {
      filters.push({
        property: '상태',
        select: {
          equals: status,
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

    // 데이터베이스 쿼리 (dataSources.query 사용)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (await client.dataSources.query({
      data_source_id: env.NOTION_DATABASE_ID,
      filter:
        filters.length === 1
          ? filters[0]
          : filters.length > 1
            ? { and: filters }
            : undefined,
      sorts: [
        {
          property: '작성일',
          direction: 'descending',
        },
      ],
      page_size: 100, // 최대 100건 조회
    } as any)) as QueryDataSourceResponse & { results: unknown[] }

    // 각 페이지에 대해 항목들을 병렬 조회
    const invoices = await Promise.all(
      (response.results as any[]).map(async (page: any) => {
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
    console.error('Failed to fetch invoices from Notion:', error)
    throw new Error('견적서 목록을 조회할 수 없습니다.')
  }
}

/**
 * 특정 ID의 견적서를 조회합니다.
 */
export async function fetchInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const client = getNotionClient()

    // Notion 페이지 조회
    const page = (await client.pages.retrieve({ page_id: id })) as any

    // 항목들 조회
    const items = await fetchInvoiceItems(id)

    return mapNotionPageToInvoice(page, items)
  } catch (error) {
    // 404 또는 권한 오류
    console.error(`Failed to fetch invoice ${id}:`, error)
    return null
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
