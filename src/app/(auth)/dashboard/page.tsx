import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/auth'
import { Container } from '@/components/layout/container'

export const metadata: Metadata = {
  title: '대시보드 | Invoice Web',
  description: '견적서 현황과 최근 견적서를 확인합니다.',
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Send,
  AlertCircle,
} from 'lucide-react'
import { InvoiceCard } from '@/components/invoices/invoice-card'
import { fetchInvoices, fetchInvoiceStats } from '@/lib/api/notion-invoices'
import { ROUTES } from '@/lib/constants'
import type { Invoice } from '@/lib/types/invoice'

// 통계 카드 컴포넌트
function StatCard({
  icon: Icon,
  title,
  value,
  bgColor,
  textColor,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: number
  bgColor: string
  textColor: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {title}
          </CardTitle>
          <div className={`rounded-lg ${bgColor} p-2`}>
            <Icon className={`h-4 w-4 ${textColor}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  // 인증된 사용자 정보 조회
  const session = await auth()
  const userName =
    session?.user?.name || session?.user?.email?.split('@')[0] || '사용자'

  // 통계 초기값 (API 실패 대비)
  let stats: Awaited<ReturnType<typeof fetchInvoiceStats>> = {
    total: 0,
    byStatus: {
      대기: 0,
      승인완료: 0,
      발송완료: 0,
      작성중: 0,
    },
  }
  let recentInvoices: Invoice[] = []
  let apiError: string | null = null

  try {
    const [statsData, invoicesData] = await Promise.all([
      fetchInvoiceStats(),
      fetchInvoices({ limit: 5 }),
    ])
    stats = statsData
    recentInvoices = invoicesData.invoices
  } catch (err) {
    apiError = err instanceof Error ? err.message : 'API 호출 실패'
    console.error('Failed to fetch dashboard data:', apiError)
  }

  return (
    <Container className="py-8">
      {/* 환영 메시지 섹션 */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          안녕하세요, {userName}님
        </h1>
        <p className="text-muted-foreground mt-2">
          오늘도 견적서 관리를 시작해 보세요.
        </p>
      </section>

      {/* API 에러 표시 */}
      {apiError && (
        <section className="mb-6">
          <div className="flex gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="font-medium text-orange-900 dark:text-orange-100">
                데이터 로드 실패
              </p>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                {apiError}
              </p>
              <p className="mt-2 text-xs text-orange-700 dark:text-orange-300">
                환경변수를 확인해주세요: NOTION_API_KEY, NOTION_DATABASE_ID
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 통계 카드 섹션 */}
      <section className="mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={TrendingUp}
            title="전체 견적서"
            value={stats.total}
            bgColor="bg-blue-100 dark:bg-blue-900"
            textColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={Clock}
            title="대기 중"
            value={stats.byStatus['대기'] || 0}
            bgColor="bg-yellow-100 dark:bg-yellow-900"
            textColor="text-yellow-600 dark:text-yellow-400"
          />
          <StatCard
            icon={CheckCircle2}
            title="승인완료"
            value={stats.byStatus['승인완료'] || 0}
            bgColor="bg-green-100 dark:bg-green-900"
            textColor="text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={Send}
            title="발송완료"
            value={stats.byStatus['발송완료'] || 0}
            bgColor="bg-purple-100 dark:bg-purple-900"
            textColor="text-purple-600 dark:text-purple-400"
          />
        </div>
      </section>

      {/* 빠른 링크 섹션 */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">빠른 메뉴</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 견적서 목록 카드 */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <FileText className="text-primary h-5 w-5" />
                </div>
                <CardTitle className="text-base">견적서 목록</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3 text-sm">
                전체 견적서를 검색하고 조회합니다.
              </p>
              <Link href={ROUTES.INVOICES}>
                <Button variant="outline" size="sm" className="w-full">
                  목록 보기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 새 견적서 작성 카드 */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Plus className="text-primary h-5 w-5" />
                </div>
                <CardTitle className="text-base">새 견적서 작성</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3 text-sm">
                새로운 견적서를 작성합니다. (준비 중)
              </p>
              <Button variant="outline" size="sm" className="w-full" disabled>
                준비 중
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 최근 견적서 섹션 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">최근 견적서</h2>
          <Link href={ROUTES.INVOICES}>
            <Button variant="ghost" size="sm">
              전체 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {recentInvoices.map(invoice => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      </section>
    </Container>
  )
}
