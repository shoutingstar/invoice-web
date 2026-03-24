import type { Metadata } from 'next'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert } from 'lucide-react'

export const metadata: Metadata = {
  title: '관리자 페이지 | Invoice Web',
  description: '관리자 전용 설정 및 관리 페이지입니다.',
}

export default async function AdminPage() {
  // 인증 및 권한 확인
  const session = await auth()
  const userRole = session?.user?.role

  // 관리자가 아니면 404 표시
  if (userRole !== 'admin') {
    notFound()
  }

  const userName = session?.user?.name || '관리자'
  const userEmail = session?.user?.email || ''

  return (
    <Container className="py-8">
      <div className="space-y-8">
        {/* 헤더 */}
        <section>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900">
              <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                관리자 페이지
              </h1>
              <p className="text-muted-foreground mt-1">
                Invoice Web 시스템 관리 및 설정
              </p>
            </div>
          </div>
        </section>

        {/* 사용자 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>로그인 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">이름</p>
                  <p className="font-medium">{userName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">이메일</p>
                  <p className="font-medium">{userEmail}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-2 text-sm">역할</p>
                <div className="flex gap-2">
                  <Badge variant="default" className="bg-blue-600">
                    {userRole === 'admin' ? '관리자' : '사용자'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 기능 상태 */}
        <Card>
          <CardHeader>
            <CardTitle>관리 기능</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">공유 링크 관리</p>
                  <p className="text-muted-foreground text-sm">
                    클라이언트 공유 링크 생성 및 관리
                  </p>
                </div>
                <Badge variant="secondary">준비 중</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">시스템 설정</p>
                  <p className="text-muted-foreground text-sm">
                    Invoice Web 시스템 설정
                  </p>
                </div>
                <Badge variant="secondary">준비 중</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">사용자 관리</p>
                  <p className="text-muted-foreground text-sm">
                    시스템 사용자 관리
                  </p>
                </div>
                <Badge variant="secondary">준비 중</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
