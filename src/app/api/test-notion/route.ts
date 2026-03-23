/**
 * Notion API 연동 테스트 Route
 * 실제 데이터 조회 및 매핑 검증
 */

import { fetchInvoices, fetchInvoiceById, fetchInvoiceStats } from '@/lib/api/notion-invoices'
import { env } from '@/lib/env'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('[TEST-NOTION] API 호출 시작')
  const { searchParams } = new URL(request.url)
  const testType = searchParams.get('type') || 'list'
  const invoiceId = searchParams.get('id')

  console.log('[TEST-NOTION] 테스트 타입:', testType)

  try {
    // 환경변수 확인
    console.log('[TEST-NOTION] 환경변수 체크:', {
      hasApiKey: !!env.NOTION_API_KEY,
      hasDatabaseId: !!env.NOTION_DATABASE_ID,
      hasItemsDatabaseId: !!env.NOTION_ITEMS_DATABASE_ID,
    })

    if (!env.NOTION_API_KEY) {
      throw new Error('NOTION_API_KEY가 설정되지 않았습니다')
    }
    if (!env.NOTION_DATABASE_ID) {
      throw new Error('NOTION_DATABASE_ID가 설정되지 않았습니다')
    }

    if (testType === 'stats') {
      // 통계 조회 테스트
      const stats = await fetchInvoiceStats()
      return NextResponse.json(
        {
          success: true,
          message: '견적서 통계 조회 성공',
          data: stats,
        },
        { status: 200 }
      )
    }

    if (testType === 'detail' && invoiceId) {
      // 상세 조회 테스트
      const invoice = await fetchInvoiceById(invoiceId)
      if (!invoice) {
        return NextResponse.json(
          {
            success: false,
            message: '견적서를 찾을 수 없습니다.',
          },
          { status: 404 }
        )
      }
      return NextResponse.json(
        {
          success: true,
          message: '견적서 상세 조회 성공',
          data: invoice,
        },
        { status: 200 }
      )
    }

    // 목록 조회 테스트 (기본값)
    const result = await fetchInvoices({ limit: 5 })
    return NextResponse.json(
      {
        success: true,
        message: '견적서 목록 조회 성공',
        data: result,
        debugInfo: {
          totalInvoices: result.total,
          returnedCount: result.invoices.length,
          firstInvoice:
            result.invoices.length > 0
              ? {
                  id: result.invoices[0].id,
                  invoiceNumber: result.invoices[0].invoiceNumber,
                  customerName: result.invoices[0].customerName,
                  status: result.invoices[0].status,
                  totalAmount: result.invoices[0].totalAmount,
                  itemsCount: result.invoices[0].items.length,
                }
              : null,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    const stack = error instanceof Error ? error.stack : ''
    console.error('[TEST-NOTION] 에러 발생:', {
      message: errorMessage,
      stack: stack,
    })
    return NextResponse.json(
      {
        success: false,
        message: 'Notion API 연동 테스트 실패',
        error: errorMessage,
        debugStack: process.env.NODE_ENV === 'development' ? stack : undefined,
      },
      { status: 500 }
    )
  }
}
