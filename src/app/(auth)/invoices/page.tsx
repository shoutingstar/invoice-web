import type { Metadata } from 'next'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { InvoiceCard } from '@/components/invoices/invoice-card'
import { InvoiceFilter } from '@/components/invoices/invoice-filter'
import { EmptyState } from '@/components/invoices/empty-state'
import { fetchInvoices } from '@/lib/api/notion-invoices'
import { PAGINATION, ROUTES } from '@/lib/constants'
import type { InvoiceStatus } from '@/lib/types/invoice'

export const metadata: Metadata = {
  title: '견적서 목록 | Invoice Web',
  description: '전체 견적서를 검색하고 관리합니다.',
}

interface InvoicesPageProps {
  searchParams: Promise<{
    search?: string
    status?: InvoiceStatus
    page?: string
  }>
}

export default async function InvoicesPage({
  searchParams,
}: InvoicesPageProps) {
  const params = await searchParams
  const search = params.search || ''
  const status = (params.status as InvoiceStatus | undefined) || ''
  const page = parseInt(params.page || '1', 10)

  // Notion API에서 데이터 조회 (API 키 미설정 시 에러)
  let result: Awaited<ReturnType<typeof fetchInvoices>> = {
    invoices: [],
    total: 0,
    page: 1,
    limit: PAGINATION.ITEMS_PER_PAGE,
    hasMore: false,
  }
  let error: string | null = null

  try {
    result = await fetchInvoices({
      search,
      status,
      page,
      limit: PAGINATION.ITEMS_PER_PAGE,
    })
  } catch (err) {
    error =
      err instanceof Error ? err.message : '견적서 목록을 조회할 수 없습니다.'
    console.error('Failed to fetch invoices:', error)
  }

  const totalPages = Math.ceil(result.total / result.limit)

  return (
    <Container className="py-8">
      {/* 페이지 헤더 */}
      <section className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">견적서 목록</h1>
        <p className="text-muted-foreground mt-2">
          전체 견적서를 검색하고 관리합니다.
        </p>
      </section>

      {/* 검색/필터 영역 */}
      <section className="mb-6">
        <InvoiceFilter defaultSearch={search} defaultStatus={status} />
      </section>

      {/* 에러 표시 */}
      {error && (
        <section className="mb-6" aria-live="polite" role="alert">
          <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
            <p className="text-destructive text-sm">
              <strong>오류:</strong> {error}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              환경변수 설정을 확인해주세요: NOTION_API_KEY, NOTION_DATABASE_ID
            </p>
          </div>
        </section>
      )}

      {/* 견적서 카드 그리드 또는 EmptyState */}
      <section className="mb-6" aria-label="견적서 목록">
        {result.invoices.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm" aria-live="polite">
                총 {result.total}건 (페이지 {result.page} / {totalPages})
              </p>
            </div>
            <div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              role="list"
              aria-label={`견적서 ${result.invoices.length}건`}
            >
              {result.invoices.map(invoice => (
                <div key={invoice.id} role="listitem">
                  <InvoiceCard invoice={invoice} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title="견적서가 없습니다"
            description={
              search || status
                ? '검색 조건에 맞는 견적서가 없습니다.'
                : '견적서 데이터가 없습니다.'
            }
            action={{ label: '대시보드로', href: ROUTES.DASHBOARD }}
          />
        )}
      </section>

      {/* 페이지네이션 */}
      {result.invoices.length > 0 && (
        <section aria-label="페이지 탐색">
          <nav
            aria-label={`총 ${totalPages}페이지 중 현재 ${page}페이지`}
            className="flex items-center justify-center gap-2"
          >
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              asChild={page > 1}
              aria-label="이전 페이지로 이동"
            >
              {page > 1 ? (
                <a
                  href={`/invoices?${new URLSearchParams({
                    ...(search && { search }),
                    ...(status && { status }),
                    page: String(page - 1),
                  }).toString()}`}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">이전 페이지</span>
                </a>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">이전 페이지</span>
                </>
              )}
            </Button>

            <div className="flex items-center gap-1" role="list">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                pageNum => (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    asChild={page !== pageNum}
                    aria-label={`${pageNum}페이지로 이동`}
                    aria-current={page === pageNum ? 'page' : undefined}
                  >
                    {page === pageNum ? (
                      <span role="listitem">{pageNum}</span>
                    ) : (
                      <a
                        role="listitem"
                        href={`/invoices?${new URLSearchParams({
                          ...(search && { search }),
                          ...(status && { status }),
                          page: String(pageNum),
                        }).toString()}`}
                      >
                        {pageNum}
                      </a>
                    )}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              asChild={page < totalPages}
              aria-label="다음 페이지로 이동"
            >
              {page < totalPages ? (
                <a
                  href={`/invoices?${new URLSearchParams({
                    ...(search && { search }),
                    ...(status && { status }),
                    page: String(page + 1),
                  }).toString()}`}
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">다음 페이지</span>
                </a>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">다음 페이지</span>
                </>
              )}
            </Button>
          </nav>
        </section>
      )}
    </Container>
  )
}
