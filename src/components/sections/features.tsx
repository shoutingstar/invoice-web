import { Container } from '@/components/layout/container'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Database, Download, Zap } from 'lucide-react'

const features = [
  {
    icon: Database,
    title: '견적서 실시간 조회',
    description:
      '노션 데이터베이스와 연동되어 항상 최신 견적서를 실시간으로 조회할 수 있습니다.',
  },
  {
    icon: Download,
    title: 'PDF 다운로드',
    description:
      '명확하고 깔끔한 형식으로 PDF를 생성하여 한 번에 다운로드할 수 있습니다.',
  },
  {
    icon: Zap,
    title: '빠른 검색',
    description:
      '견적서를 빠르게 찾고 상세 정보를 확인하며 필요한 정보를 쉽게 관리합니다.',
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-muted/50 py-20">
      <Container>
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold">주요 기능</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            프로덕션 준비가 완료된 강력한 기능들로 빠르고 안정적인 웹
            애플리케이션을 구축하세요.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(feature => (
            <Card
              key={feature.title}
              className="bg-background border-0 shadow-none"
            >
              <CardHeader>
                <feature.icon className="text-primary mb-2 h-10 w-10" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
