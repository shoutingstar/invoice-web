'use client'

import { useEffect } from 'react'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

interface InvoicesErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function InvoicesError({ error, reset }: InvoicesErrorProps) {
  useEffect(() => {
    // 에러를 콘솔에 기록 (개발용)
    console.error('견적서 목록 에러:', error)
  }, [error])

  return (
    <Container className="py-16">
      <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <div className="text-muted-foreground mb-4">
          <AlertCircle className="h-12 w-12" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">오류가 발생했습니다</h3>
        <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
          견적서 목록을 불러오는 중에 오류가 발생했습니다. 다시 시도하거나
          대시보드로 돌아가세요.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => reset()}>
            다시 시도
          </Button>
          <Button asChild>
            <a href={ROUTES.DASHBOARD}>대시보드로</a>
          </Button>
        </div>
      </div>
    </Container>
  )
}
