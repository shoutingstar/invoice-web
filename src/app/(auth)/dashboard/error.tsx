'use client'

import { useEffect } from 'react'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface DashboardErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    // 에러를 콘솔에 기록 (개발용)
    console.error('대시보드 에러:', error)
  }, [error])

  return (
    <Container className="py-8">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>대시보드를 불러오지 못했습니다</AlertTitle>
          <AlertDescription>
            {error.message || '알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.'}
          </AlertDescription>
        </Alert>
        <Button onClick={reset} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </Button>
      </div>
    </Container>
  )
}
