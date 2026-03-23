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

      // API에서 PDF 다운로드
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`)

      if (!response.ok) {
        throw new Error('PDF 생성에 실패했습니다.')
      }

      // PDF Blob으로 변환
      const blob = await response.blob()

      // 다운로드 링크 생성 및 클릭
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `견적서_${invoice.invoiceNumber}_${invoice.createdDate}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF 다운로드 오류:', error)
      alert('PDF 다운로드에 실패했습니다.')
    } finally {
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
