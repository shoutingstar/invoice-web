import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { FileSearch, LayoutDashboard } from 'lucide-react'

export default function AuthNotFound() {
  return (
    <Container className="py-8">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        {/* 아이콘 */}
        <div className="bg-muted rounded-full p-6">
          <FileSearch className="text-muted-foreground h-12 w-12" />
        </div>

        {/* 메시지 */}
        <div>
          <h1 className="mb-2 text-4xl font-bold">404</h1>
          <h2 className="mb-2 text-xl font-semibold">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-muted-foreground max-w-sm">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        {/* 대시보드로 돌아가기 */}
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              대시보드로 가기
            </Button>
          </Link>
          <Link href="/invoices">
            <Button variant="outline">견적서 목록</Button>
          </Link>
        </div>
      </div>
    </Container>
  )
}
