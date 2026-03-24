/**
 * 공유 링크 만료 또는 위조 토큰 안내 페이지
 * verifyShareToken()이 null 반환 시 표시
 */

import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock } from 'lucide-react'

export default function ShareNotFound() {
  return (
    <Container size="sm" className="py-16">
      <div className="flex flex-col items-center text-center">
        {/* 만료 아이콘 */}
        <div className="bg-muted mb-6 flex h-16 w-16 items-center justify-center rounded-full">
          <Clock className="text-muted-foreground h-8 w-8" aria-hidden="true" />
        </div>

        {/* 제목 */}
        <h1 className="mb-2 text-2xl font-bold">링크가 유효하지 않습니다</h1>

        {/* 안내 메시지 */}
        <p className="text-muted-foreground mb-2 text-sm leading-relaxed">
          이 공유 링크는 만료되었거나 올바르지 않은 링크입니다.
        </p>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          공유 링크는 생성 후 7일 동안만 유효합니다.
          <br />
          견적서를 확인하려면 관리자에게 새 링크를 요청하세요.
        </p>

        {/* 경고 박스 */}
        <div className="bg-muted/50 mb-8 flex items-start gap-2 rounded-lg p-4 text-left text-sm">
          <AlertTriangle
            className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <p className="text-muted-foreground">
            보안을 위해 공유 링크는 유효 기간이 지나면 자동으로 비활성화됩니다.
          </p>
        </div>

        {/* 홈으로 이동 버튼 */}
        <Link href="/login">
          <Button variant="outline">로그인하여 견적서 보기</Button>
        </Link>
      </div>
    </Container>
  )
}
