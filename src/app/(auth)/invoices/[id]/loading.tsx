import { Container } from '@/components/layout/container'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function InvoiceDetailLoading() {
  return (
    <Container size="md" className="py-8">
      {/* 목록으로 돌아가기 스켈레톤 */}
      <div className="mb-6">
        <Skeleton className="h-8 w-36" />
      </div>

      {/* 페이지 헤더 스켈레톤 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-9 w-36 sm:self-start" />
      </div>

      {/* 기본 정보 섹션 스켈레톤 */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 항목 테이블 스켈레톤 */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-5 w-20" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-6 pb-6">
            {/* 헤더 행 */}
            <div className="flex gap-4 py-3 border-b mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 flex-1 hidden sm:block" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-20 hidden sm:block" />
              <Skeleton className="h-4 w-24" />
            </div>
            {/* 항목 행 5개 */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 py-3 border-b last:border-0">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 flex-1 hidden sm:block" />
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 w-24 hidden sm:block" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 합계 섹션 스켈레톤 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-3 max-w-sm ml-auto">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="border-t pt-3 flex justify-between">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 담당자 정보 스켈레톤 */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 하단 버튼 스켈레톤 */}
      <div className="mt-8 flex justify-center">
        <Skeleton className="h-9 w-36" />
      </div>
    </Container>
  )
}
