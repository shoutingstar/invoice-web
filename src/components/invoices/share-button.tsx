'use client'

/**
 * 견적서 공유 링크 생성 버튼
 * POST /api/invoices/[id]/share 호출 후 클립보드에 URL 복사
 * HTTPS 또는 localhost 환경에서만 clipboard API 작동
 */

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  invoiceId: string
}

export function ShareButton({ invoiceId }: ShareButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleShare = () => {
    startTransition(async () => {
      try {
        // 공유 토큰 생성 API 호출
        const response = await fetch(`/api/invoices/${invoiceId}/share`, {
          method: 'POST',
        })

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string }
          throw new Error(errorData.error ?? '공유 링크 생성에 실패했습니다.')
        }

        const data = (await response.json()) as {
          shareUrl: string
          expiresInDays: number
        }

        // clipboard API는 HTTPS 또는 localhost에서만 작동
        const isSecureContext =
          typeof window !== 'undefined' && window.isSecureContext

        if (isSecureContext && navigator.clipboard) {
          await navigator.clipboard.writeText(data.shareUrl)
          toast.success('링크가 복사되었습니다', {
            description: `${data.expiresInDays}일 후 만료됩니다`,
            duration: 4000,
          })
        } else {
          // fallback: 보안 컨텍스트가 아닌 경우 URL 표시
          toast.info('공유 링크가 생성되었습니다', {
            description: data.shareUrl,
            duration: 8000,
          })
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : '공유 링크 생성에 실패했습니다.'
        toast.error('공유 실패', { description: message })
      }
    })
  }

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      disabled={isPending}
      className="gap-2 sm:self-start print:hidden"
      aria-label="견적서 공유 링크 복사"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          생성 중...
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" aria-hidden="true" />
          공유
        </>
      )}
    </Button>
  )
}
