/**
 * 견적서 404 페이지
 */

import { Container } from '@/components/layout/container'
import { EmptyState } from '@/components/invoices/empty-state'
import { ROUTES } from '@/lib/constants'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <Container className="py-16">
      <EmptyState
        icon={<FileQuestion className="h-16 w-16" />}
        title="견적서를 찾을 수 없습니다"
        description="요청하신 견적서가 존재하지 않습니다. 견적서 번호를 다시 확인해주세요."
        action={{ label: '목록으로 돌아가기', href: ROUTES.INVOICES }}
      />
    </Container>
  )
}
