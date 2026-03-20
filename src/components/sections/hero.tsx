import { Container } from '@/components/layout/container'
import { Badge } from '@/components/ui/badge'

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            📄 Invoice Web 서비스
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            노션 견적서를
            <span className="text-primary mt-2 block">
              웹으로 확인하고 PDF로 다운로드
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
            노션 데이터베이스에서 관리되는 견적서를 클라이언트가 웹으로 편하게
            확인하고 PDF로 다운로드할 수 있는 간편한 웹 애플리케이션입니다.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4 text-center md:grid-cols-3">
            <div>
              <div className="text-2xl font-bold">빠른 조회</div>
              <div className="text-muted-foreground text-sm">실시간 동기화</div>
            </div>
            <div>
              <div className="text-2xl font-bold">PDF 다운로드</div>
              <div className="text-muted-foreground text-sm">한 번에 저장</div>
            </div>
            <div>
              <div className="text-2xl font-bold">안전한 접근</div>
              <div className="text-muted-foreground text-sm">로그인 인증</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
