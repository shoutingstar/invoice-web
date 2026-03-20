import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'

export function CTASection() {
  return (
    <section className="py-20">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold">견적서 확인하기</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            로그인하여 노션에서 관리하는 견적서를 웹에서 바로 확인하고 PDF로
            다운로드할 수 있습니다.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="px-8 text-base">
                로그인하기
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
