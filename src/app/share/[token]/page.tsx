/**
 * 공유 링크 견적서 조회 페이지
 * 인증 불필요 - 유효한 HMAC 토큰으로 접근
 * 토큰 검증 실패 시 not-found로 처리
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { InvoiceDetail } from '@/components/invoices/invoice-detail'
import { SharePdfButton } from '@/components/invoices/share-pdf-button'
import { verifyShareToken } from '@/lib/share-token'
import { fetchInvoiceById } from '@/lib/api/notion-invoices'
import { env } from '@/lib/env'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params

  // 토큰 검증
  const secret = env.NEXTAUTH_SECRET ?? ''
  const invoiceId = await verifyShareToken(token, secret)

  if (!invoiceId) {
    return {
      title: '유효하지 않은 공유 링크 | Invoice Web',
    }
  }

  const invoice = await fetchInvoiceById(invoiceId)

  if (!invoice) {
    return {
      title: '견적서를 찾을 수 없음 | Invoice Web',
    }
  }

  return {
    title: `${invoice.invoiceNumber} - ${invoice.customerName} | Invoice Web`,
    description: `${invoice.customerName} 견적서 공유 페이지`,
    // 검색 엔진 색인 방지 (공유 링크는 비공개)
    robots: { index: false, follow: false },
  }
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // HMAC 서명 검증 + 만료 확인
  const secret = env.NEXTAUTH_SECRET ?? ''
  const invoiceId = await verifyShareToken(token, secret)

  // 토큰이 유효하지 않거나 만료된 경우 404
  if (!invoiceId) {
    notFound()
  }

  // Notion에서 견적서 조회
  const invoice = await fetchInvoiceById(invoiceId)

  // 견적서가 삭제된 경우 404
  if (!invoice) {
    notFound()
  }

  return (
    <Container size="md" className="py-8">
      {/* 공유 링크 안내 */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            공유된 견적서입니다.
          </p>
        </div>
        {/* PDF 다운로드 버튼 - Client Component */}
        <SharePdfButton invoiceNumber={invoice.invoiceNumber} />
      </div>

      {/* 견적서 상세 내용 */}
      <div id="invoice-detail-container">
        <InvoiceDetail invoice={invoice} />
      </div>
    </Container>
  )
}
