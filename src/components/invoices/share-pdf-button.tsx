'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * 공유 페이지용 PDF 다운로드 버튼
 * Client Component로 구현되어 onClick 핸들러 사용 가능
 */

interface SharePdfButtonProps {
  invoiceNumber: string
}

export function SharePdfButton({ invoiceNumber }: SharePdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadPdf = async () => {
    try {
      setIsLoading(true)
      console.log('🔵 PDF 다운로드 버튼 클릭됨')

      const element = document.getElementById('invoice-detail-container')
      if (!element) {
        console.error('❌ invoice-detail-container 요소를 찾을 수 없습니다')
        alert('견적서를 찾을 수 없습니다.')
        return
      }
      console.log('✅ 견적서 요소 찾음')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2pdfLib = (window as any).html2pdf
      if (!html2pdfLib) {
        console.error('❌ html2pdf 라이브러리를 찾을 수 없습니다')
        alert(
          'PDF 라이브러리가 로드되지 않았습니다. 페이지를 새로고침 후 시도해주세요.'
        )
        return
      }
      console.log('✅ html2pdf 라이브러리 로드됨')

      const opt = {
        margin: 10,
        filename: `${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      }
      console.log('📋 PDF 옵션:', opt)
      console.log('⏳ PDF 생성 중...')

      // html2pdf는 체인 가능한 API 제공
      await html2pdfLib().set(opt).from(element).save()

      console.log('✅ PDF 다운로드 완료')
      alert('PDF가 다운로드되었습니다!')
    } catch (error) {
      console.error('❌ PDF 생성 오류:', error)
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
