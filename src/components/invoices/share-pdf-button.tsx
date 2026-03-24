'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'

/**
 * 공유 페이지용 PDF 다운로드 버튼
 * 서버 사이드에서 Puppeteer로 PDF 생성
 */

interface SharePdfButtonProps {
  invoiceNumber: string
}

export function SharePdfButton({ invoiceNumber }: SharePdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const params = useParams()
  const token = params.token as string

  const handleDownloadPdf = async () => {
    try {
      setIsLoading(true)
      console.log('🔵 PDF 다운로드 시작')

      // 서버 API에서 PDF 생성
      const response = await fetch(`/api/share/${token}/pdf`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'PDF 생성 실패')
      }

      console.log('✅ PDF 생성 완료')

      // Blob을 다운로드
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      console.log('✅ PDF 다운로드 완료')
      alert('PDF가 다운로드되었습니다!')
    } catch (error) {
      console.error('❌ PDF 다운로드 오류:', error)
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      alert(`PDF 다운로드 중 오류가 발생했습니다: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownloadPdf}
      disabled={isLoading}
      className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          생성 중...
        </>
      ) : (
        <>📥 PDF 다운로드</>
      )}
    </button>
  )
}
