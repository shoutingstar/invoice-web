import { Container } from '@/components/layout/container'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DashboardLoading() {
  return (
    <Container className="py-8">
      {/* 환영 메시지 스켈레톤 */}
      <section aria-label="로딩 중" className="mb-8">
        <Skeleton className="mb-2 h-9 w-64" />
        <Skeleton className="h-5 w-48" />
      </section>

      {/* 통계 카드 4개 스켈레톤 (실제 레이아웃과 동일) */}
      <section className="mb-8" aria-hidden="true">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-9 rounded-lg" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 빠른 메뉴 스켈레톤 */}
      <section className="mb-8" aria-hidden="true">
        <Skeleton className="mb-4 h-7 w-28" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-3 h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 최근 견적서 스켈레톤 */}
      <section aria-hidden="true">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Skeleton className="mb-1.5 h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-3 border-t" />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="mt-3 rounded-md px-3 py-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Container>
  )
}
