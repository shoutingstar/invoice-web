/**
 * 공유 페이지 로딩 스켈레톤 UI
 * 토큰 검증 및 Notion API 호출 중 표시
 */

import { Container } from '@/components/layout/container'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ShareLoading() {
  return (
    <Container size="md" className="py-8">
      {/* 헤더 스켈레톤 */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* 카드 스켈레톤 반복 */}
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="mb-5">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 테이블 스켈레톤 */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-20" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4">
              <Skeleton className="col-span-2 h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
            </div>
          ))}
        </CardContent>
      </Card>
    </Container>
  )
}
