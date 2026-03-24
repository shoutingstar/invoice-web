/**
 * On-Demand Revalidation API
 *
 * Notion 데이터가 변경되었을 때 캐시를 수동으로 무효화하는 엔드포인트입니다.
 *
 * 사용 예시:
 *   POST /api/revalidate
 *   Authorization: Bearer {REVALIDATE_SECRET}
 *   Body: { "tag": "notion-invoices" }
 *
 * 지원하는 태그:
 *   - "notion-invoices"   : 견적서 목록 전체 캐시 무효화
 *   - "notion-invoice-{id}": 특정 견적서 캐시 무효화
 *   - "all"               : 모든 Notion 캐시 무효화
 */

import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  // 시크릿 키로 인가 검증
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (token !== process.env.REVALIDATE_SECRET) {
    return Response.json(
      { success: false, message: '인증되지 않은 요청입니다.' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { tag, invoiceId } = body as { tag?: string; invoiceId?: string }

    if (tag === 'all') {
      // 모든 Notion 관련 캐시 무효화
      revalidatePath('/dashboard')
      revalidatePath('/invoices')
      revalidatePath('/', 'layout')
      return Response.json({
        success: true,
        message: '모든 Notion 캐시를 무효화했습니다.',
        revalidated: ['/dashboard', '/invoices'],
      })
    }

    if (tag === 'notion-invoices') {
      // 견적서 목록 캐시 무효화
      revalidatePath('/dashboard')
      revalidatePath('/invoices')
      return Response.json({
        success: true,
        message: '견적서 목록 캐시를 무효화했습니다.',
        revalidated: ['/dashboard', '/invoices'],
      })
    }

    if (invoiceId) {
      // 특정 견적서 캐시 무효화
      revalidatePath(`/invoices/${invoiceId}`)
      revalidatePath('/invoices')
      return Response.json({
        success: true,
        message: `견적서 ${invoiceId} 캐시를 무효화했습니다.`,
        revalidated: [`/invoices/${invoiceId}`],
      })
    }

    return Response.json(
      {
        success: false,
        message: 'tag 또는 invoiceId 파라미터가 필요합니다.',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Revalidation 처리 중 오류:', error)
    return Response.json(
      { success: false, message: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * GET 요청으로 캐시 상태 확인 (개발용)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (token !== process.env.REVALIDATE_SECRET) {
    return Response.json(
      { success: false, message: '인증되지 않은 요청입니다.' },
      { status: 401 }
    )
  }

  return Response.json({
    success: true,
    message: 'Revalidation API가 정상 동작 중입니다.',
    availableTags: ['notion-invoices', 'notion-invoice-{id}', 'all'],
    usage: {
      method: 'POST',
      headers: { Authorization: 'Bearer {REVALIDATE_SECRET}' },
      body: { tag: 'notion-invoices' },
    },
  })
}
