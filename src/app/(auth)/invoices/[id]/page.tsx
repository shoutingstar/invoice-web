import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { InvoiceDetail } from '@/components/invoices/invoice-detail'
import { PDFDownloadButton } from '@/components/invoices/pdf-download-button'
import { AdvancedShareButton } from '@/components/invoices/advanced-share-button'
import { fetchInvoiceById } from '@/lib/api/notion-invoices'
import { ROUTES } from '@/lib/constants'

/**
 * 동적 메타데이터: 견적서 번호와 고객사명을 title에 반영
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const invoice = await fetchInvoiceById(id)

  if (!invoice) {
    return {
      title: '견적서를 찾을 수 없음 | Invoice Web',
    }
  }

  return {
    title: `${invoice.invoiceNumber} - ${invoice.customerName} | Invoice Web`,
    description: `${invoice.customerName} 견적서 상세 정보 및 PDF 다운로드`,
  }
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Next.js 15에서 params는 Promise로 처리
  const { id } = await params

  // Notion API에서 견적서 조회 (generateMetadata와 캐시 공유)
  const invoice = await fetchInvoiceById(id)

  // 존재하지 않으면 404 페이지로
  if (!invoice) {
    notFound()
  }

  return (
    <Container size="md" className="py-8">
      {/* 목록으로 돌아가기 링크 (인쇄 시 숨김) */}
      <div className="mb-6 print:hidden">
        <Link href={ROUTES.INVOICES}>
          <Button variant="ghost" size="sm" className="-ml-2 gap-2">
            <ArrowLeft className="h-4 w-4" />
            견적서 목록으로
          </Button>
        </Link>
      </div>

      {/* 페이지 헤더 및 PDF 다운로드 버튼 */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
        {/* PDF 다운로드 + 공유 버튼 묶음 */}
        <div className="flex gap-2 print:hidden">
          {/* 이메일/텔레그램/링크복사 공유 드롭다운 */}
          <AdvancedShareButton
            invoiceId={invoice.id}
            invoiceNumber={invoice.invoiceNumber}
            customerName={invoice.customerName}
          />
          <PDFDownloadButton invoice={invoice} />
        </div>
      </div>

      {/* InvoiceDetail 컴포넌트로 상세 정보 렌더링 (PDF 캡처용) */}
      <div id="invoice-print-layout" className="mb-8">
        <InvoiceDetail invoice={invoice} />
      </div>

      {/* 하단 목록으로 돌아가기 링크 (인쇄 시 숨김) */}
      <div className="mt-8 flex justify-center print:hidden">
        <Link href={ROUTES.INVOICES}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    </Container>
  )
}
