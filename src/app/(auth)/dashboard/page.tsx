import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, ArrowRight, TrendingUp, Clock, CheckCircle2, Send } from 'lucide-react'
import { InvoiceCard } from '@/components/invoices/invoice-card'
import { getMockInvoices, getInvoiceStats } from '@/lib/mock-data'
import { ROUTES } from '@/lib/constants'

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
          <CardTitle className="text-sm font-medium text-muted-foreground">
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

export default function DashboardPage() {
  const invoices = getMockInvoices()
  const stats = getInvoiceStats()
  const recentInvoices = invoices.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()).slice(0, 5)

  return (
    <Container className="py-8">
      {/* 환영 메시지 섹션 */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          안녕하세요, 김담당님
        </h1>
        <p className="text-muted-foreground mt-2">
          오늘도 견적서 관리를 시작해 보세요.
        </p>
      </section>

      {/* 통계 카드 섹션 */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            value={stats['대기']}
            bgColor="bg-yellow-100 dark:bg-yellow-900"
            textColor="text-yellow-600 dark:text-yellow-400"
          />
          <StatCard
            icon={CheckCircle2}
            title="승인완료"
            value={stats['승인완료']}
            bgColor="bg-green-100 dark:bg-green-900"
            textColor="text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={Send}
            title="발송완료"
            value={stats['발송완료']}
            bgColor="bg-purple-100 dark:bg-purple-900"
            textColor="text-purple-600 dark:text-purple-400"
          />
        </div>
      </section>

      {/* 빠른 링크 섹션 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">빠른 메뉴</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 견적서 목록 카드 */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">견적서 목록</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
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
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">새 견적서 작성</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">최근 견적서</h2>
          <Link href={ROUTES.INVOICES}>
            <Button variant="ghost" size="sm">
              전체 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {recentInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={{
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                customerName: invoice.customerName,
                customerPhone: invoice.customerPhone,
                customerEmail: invoice.customerEmail,
                createdDate: invoice.createdDate,
                validUntil: invoice.validUntil,
                status: invoice.status,
                totalAmount: invoice.totalAmount,
                managerName: invoice.managerName,
                managerEmail: invoice.managerEmail,
                managerPhone: invoice.managerPhone,
                notes: invoice.notes,
              }}
            />
          ))}
        </div>
      </section>
    </Container>
  )
}
