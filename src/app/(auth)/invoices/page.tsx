'use client'

import { Container } from '@/components/layout/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { InvoiceCard } from '@/components/invoices/invoice-card'
import { EmptyState } from '@/components/invoices/empty-state'
import { getMockInvoices } from '@/lib/mock-data'
import { PAGINATION, ROUTES } from '@/lib/constants'
import { INVOICE_STATUS_OPTIONS } from '@/lib/schemas/search-filter'
import { useState } from 'react'
import type { InvoiceStatus } from '@/lib/types/invoice'

export default function InvoicesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('')

  const allInvoices = getMockInvoices()

  // 필터링 로직 (Phase 4에서 완성, 현재는 UI만)
  const filteredInvoices = allInvoices.filter(invoice => {
    const matchesSearch =
      searchQuery === '' ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === '' || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // 페이지네이션
  const itemsPerPage = PAGINATION.ITEMS_PER_PAGE
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedInvoices = filteredInvoices.slice(
    startIdx,
    startIdx + itemsPerPage
  )

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
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* 검색 입력 */}
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="고객사명 또는 견적서 번호로 검색..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>
              {/* 상태 필터 */}
              <Select
                value={statusFilter}
                onValueChange={value => {
                  setStatusFilter(value as InvoiceStatus | '')
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_STATUS_OPTIONS.map(option => (
                    <SelectItem
                      key={option.value || 'all'}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 견적서 카드 그리드 또는 EmptyState */}
      <section className="mb-6">
        {paginatedInvoices.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                총 {filteredInvoices.length}건 (페이지 {currentPage} /{' '}
                {totalPages})
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedInvoices.map(invoice => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={{
                    id: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    customerName: invoice.customerName,
                    customerPhone: invoice.customerPhone,
                    customerEmail: invoice.customerEmail,
                    createdDate: invoice.createdDate,
                    validUntil: invoice.validUntil,
                    status: invoice.status,
                    totalAmount: invoice.totalAmount,
                    managerName: invoice.managerName,
                    managerEmail: invoice.managerEmail,
                    managerPhone: invoice.managerPhone,
                    notes: invoice.notes,
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title="견적서가 없습니다"
            description={
              searchQuery || statusFilter
                ? '검색 조건에 맞는 견적서가 없습니다.'
                : '견적서 데이터가 없습니다.'
            }
            action={{ label: '대시보드로', href: ROUTES.DASHBOARD }}
          />
        )}
      </section>

      {/* 페이지네이션 */}
      {paginatedInvoices.length > 0 && totalPages > 1 && (
        <section>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">이전 페이지</span>
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage(prev => Math.min(totalPages, prev + 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">다음 페이지</span>
            </Button>
          </div>
        </section>
      )}
    </Container>
  )
}
