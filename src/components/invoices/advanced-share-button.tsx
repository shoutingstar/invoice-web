'use client'

/**
 * 견적서 공유 드롭다운 버튼
 * 이메일, 텔레그램, 링크 복사 세 가지 공유 방식 제공
 * 공유 토큰은 API에서 생성 후 각 채널로 전달
 */

import { useTransition } from 'react'
import { Mail, Send, Copy, Share2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdvancedShareButtonProps {
  /** Notion 페이지 ID */
  invoiceId: string
  /** 견적서 번호 (예: INV-2026-001) */
  invoiceNumber: string
  /** 고객사명 */
  customerName: string
}

/**
 * 이메일 공유용 mailto 링크 생성
 */
function generateEmailLink(
  invoiceNumber: string,
  customerName: string,
  shareUrl: string
): string {
  const subject = `${invoiceNumber} - Invoice Web 공유`
  const body = [
    `${invoiceNumber} - ${customerName} 견적서를 공유합니다.`,
    '',
    `공유 링크: ${shareUrl}`,
    `유효 기간: 7일`,
    '',
    '위 링크에서 로그인 없이 견적서를 조회할 수 있습니다.',
  ].join('\n')

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/**
 * 텔레그램 웹 공유 링크 생성
 */
function generateTelegramLink(invoiceNumber: string, shareUrl: string): string {
  const message = `${invoiceNumber} 견적서를 공유합니다. ${shareUrl}`
  return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`
}

export function AdvancedShareButton({
  invoiceId,
  invoiceNumber,
  customerName,
}: AdvancedShareButtonProps) {
  const [isPending, startTransition] = useTransition()

  /**
   * 공유 토큰 생성 API 호출 후 shareUrl 반환
   * 실패 시 null 반환
   */
  const fetchShareUrl = async (): Promise<string | null> => {
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

    return data.shareUrl
  }

  /**
   * 이메일로 공유: 기본 메일 클라이언트 열기
   */
  const handleEmailShare = () => {
    startTransition(async () => {
      try {
        const shareUrl = await fetchShareUrl()
        if (!shareUrl) return

        const mailtoLink = generateEmailLink(
          invoiceNumber,
          customerName,
          shareUrl
        )
        // TODO: window.location.href 또는 <a> 클릭으로 메일 클라이언트 실행
        window.location.href = mailtoLink
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : '공유 링크 생성에 실패했습니다.'
        toast.error('이메일 공유 실패', { description: message })
      }
    })
  }

  /**
   * 텔레그램으로 공유: 새 탭에서 텔레그램 웹 공유 열기
   */
  const handleTelegramShare = () => {
    startTransition(async () => {
      try {
        const shareUrl = await fetchShareUrl()
        if (!shareUrl) return

        const telegramLink = generateTelegramLink(invoiceNumber, shareUrl)
        // TODO: 새 탭에서 텔레그램 공유 페이지 열기
        window.open(telegramLink, '_blank', 'noopener,noreferrer')
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : '공유 링크 생성에 실패했습니다.'
        toast.error('텔레그램 공유 실패', { description: message })
      }
    })
  }

  /**
   * 링크 복사: 클립보드에 공유 URL 저장
   */
  const handleCopyLink = () => {
    startTransition(async () => {
      try {
        const shareUrl = await fetchShareUrl()
        if (!shareUrl) return

        // clipboard API는 HTTPS 또는 localhost 환경에서만 작동
        const isSecureContext =
          typeof window !== 'undefined' && window.isSecureContext

        if (isSecureContext && navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl)
          toast.success('링크가 복사되었습니다', {
            description: '7일 후 만료됩니다',
            duration: 4000,
          })
        } else {
          // fallback: 보안 컨텍스트 미지원 시 URL을 토스트로 표시
          toast.info('공유 링크가 생성되었습니다', {
            description: shareUrl,
            duration: 8000,
          })
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : '공유 링크 생성에 실패했습니다.'
        toast.error('링크 복사 실패', { description: message })
      }
    })
  }

  return (
    <DropdownMenu>
      {/* 공유 트리거 버튼 */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isPending}
          className="gap-2 sm:self-start print:hidden"
          aria-label="견적서 공유 옵션 열기"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              처리 중...
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" aria-hidden="true" />
              공유
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      {/* 공유 옵션 드롭다운 메뉴 */}
      <DropdownMenuContent align="end" className="w-52">
        {/* 이메일로 공유 */}
        <DropdownMenuItem
          onClick={handleEmailShare}
          className="cursor-pointer gap-3"
          aria-label="이메일로 견적서 공유"
        >
          <Mail
            className="text-muted-foreground h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <span>이메일로 공유</span>
        </DropdownMenuItem>

        {/* 텔레그램으로 공유 */}
        <DropdownMenuItem
          onClick={handleTelegramShare}
          className="cursor-pointer gap-3"
          aria-label="텔레그램으로 견적서 공유"
        >
          <Send
            className="text-muted-foreground h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <span>텔레그램으로 공유</span>
        </DropdownMenuItem>

        {/* 링크 복사 */}
        <DropdownMenuItem
          onClick={handleCopyLink}
          className="cursor-pointer gap-3"
          aria-label="견적서 공유 링크 클립보드에 복사"
        >
          <Copy
            className="text-muted-foreground h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <span>링크 복사</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
