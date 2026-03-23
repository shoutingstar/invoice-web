/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * API 응답 관련 타입 정의
 */

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface InvoiceListResult {
  invoices: any[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  nextCursor?: string
}
