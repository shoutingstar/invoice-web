import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'
import { InvoiceDetail } from '@/components/invoices/invoice-detail'
import { getMockInvoiceById } from '@/lib/mock-data'
import { ROUTES } from '@/lib/constants'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Next.js 15에서 params는 Promise로 처리
  const { id } = await params

  // mock-data에서 견적서 조회
  const invoice = getMockInvoiceById(id)

  // 존재하지 않으면 404 페이지로
  if (!invoice) {
    notFound()
  }

  return (
    <Container size="md" className="py-8">
      {/* 목록으로 돌아가기 링크 */}
      <div className="mb-6">
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
        {/* PDF 다운로드 버튼 (Phase 3에서 기능 구현) */}
        <Button className="gap-2 sm:self-start" disabled>
          <Download className="h-4 w-4" />
          PDF 다운로드
        </Button>
      </div>

      {/* InvoiceDetail 컴포넌트로 상세 정보 렌더링 */}
      <InvoiceDetail invoice={invoice} />

      {/* 하단 목록으로 돌아가기 링크 */}
      <div className="mt-8 flex justify-center">
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
