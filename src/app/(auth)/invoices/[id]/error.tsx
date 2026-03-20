'use client'

import { useEffect } from 'react'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

interface InvoiceDetailErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function InvoiceDetailError({
  error,
  reset,
}: InvoiceDetailErrorProps) {
  useEffect(() => {
    // 에러를 콘솔에 기록 (개발용)
    console.error('견적서 상세 에러:', error)
  }, [error])

  return (
    <Container className="py-16">
      <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <div className="mb-4 text-muted-foreground">
          <AlertCircle className="h-12 w-12" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">오류가 발생했습니다</h3>
        <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
          견적서를 불러오는 중에 오류가 발생했습니다. 다시 시도하거나 목록으로 돌아가세요.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => reset()}>
            다시 시도
          </Button>
          <Button asChild>
            <a href={ROUTES.INVOICES}>목록으로</a>
          </Button>
        </div>
      </div>
    </Container>
  )
}
