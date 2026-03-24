'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import type { InvoiceStatus } from '@/lib/types/invoice'

interface InvoiceFilterProps {
  defaultSearch?: string
  defaultStatus?: InvoiceStatus | ''
}

/**
 * 견적서 목록 필터 컴포넌트
 * URL search params를 사용하여 검색/필터 상태 관리
 */
export function InvoiceFilter({
  defaultSearch = '',
  defaultStatus = '',
}: InvoiceFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(defaultSearch)
  const [status, setStatus] = useState<InvoiceStatus | ''>(defaultStatus)

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams)

    if (search.trim()) {
      params.set('search', search)
    } else {
      params.delete('search')
    }

    // 페이지네이션 초기화
    params.set('page', '1')

    const queryString = params.toString()
    router.push(`/invoices${queryString ? '?' + queryString : ''}`)
  }, [search, searchParams, router])

  const handleStatusChange = (value: string) => {
    const newStatus = (value === 'all' ? '' : value) as InvoiceStatus | ''
    setStatus(newStatus)

    const params = new URLSearchParams(searchParams)

    if (newStatus) {
      params.set('status', newStatus)
    } else {
      params.delete('status')
    }

    // 페이지네이션 초기화
    params.set('page', '1')

    const queryString = params.toString()
    router.push(`/invoices${queryString ? '?' + queryString : ''}`)
  }

  const handleReset = useCallback(() => {
    setSearch('')
    setStatus('')
    router.push('/invoices')
  }, [router])

  return (
    <div
      className="border-border bg-card space-y-4 rounded-lg border p-4"
      role="search"
      aria-label="견적서 검색 및 필터"
    >
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="invoice-search" className="sr-only">
            견적서 검색
          </label>
          <Input
            id="invoice-search"
            placeholder="견적서 번호 또는 고객사명 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSearch()
            }}
            aria-label="견적서 번호 또는 고객사명으로 검색"
          />
        </div>
        <Button
          onClick={handleSearch}
          size="icon"
          variant="default"
          aria-label="검색 실행"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="invoice-status-filter" className="sr-only">
            상태 필터
          </label>
          <Select
            value={status || 'all'}
            onValueChange={handleStatusChange}
            name="invoice-status-filter"
          >
            <SelectTrigger aria-label="견적서 상태 필터 선택">
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="대기">대기</SelectItem>
              <SelectItem value="승인완료">승인완료</SelectItem>
              <SelectItem value="발송완료">발송완료</SelectItem>
              <SelectItem value="작성중">작성중</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(search || status) && (
          <Button
            onClick={handleReset}
            variant="outline"
            aria-label="검색 및 필터 초기화"
          >
            초기화
          </Button>
        )}
      </div>
    </div>
  )
}
