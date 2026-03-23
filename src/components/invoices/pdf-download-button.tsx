'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import type { Invoice } from '@/lib/types/invoice'

interface PDFDownloadButtonProps {
  invoice: Invoice
}

/**
 * 견적서를 PDF로 다운로드하는 버튼
 * 서버 사이드 pdfkit을 사용하여 PDF 생성 (한글 지원)
 */
export function PDFDownloadButton({ invoice }: PDFDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true)

      // API에서 HTML을 열면 html2pdf.js가 자동으로 PDF 생성 및 다운로드
      window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')

      // 사용자 피드백을 위해 약간 대기 후 로딩 해제
      setTimeout(() => {
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error('PDF 다운로드 오류:', error)
      alert('PDF 다운로드에 실패했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleDownloadPDF}
      disabled={isLoading}
      className="gap-2 sm:self-start print:hidden"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          생성 중...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          PDF 다운로드
        </>
      )}
    </Button>
  )
}
