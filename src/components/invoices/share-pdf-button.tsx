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

      // 렌더링할 요소의 클론 생성
      const clonedElement = element.cloneNode(true) as HTMLElement

      // Tailwind CSS v4의 lab()/light-dark() 색상 함수 지원 문제 해결
      // 모든 <style> 태그를 제거하여 Tailwind 스타일이 적용되지 않도록 함
      const styleTags = clonedElement.querySelectorAll('style')
      styleTags.forEach(tag => tag.remove())

      // <head>의 style도 제거 (없을 수도 있지만 안전을 위해)
      const headInClone = clonedElement.querySelector('head')
      if (headInClone) {
        const headStyles = headInClone.querySelectorAll('style')
        headStyles.forEach(tag => tag.remove())
      }

      // 클래스 제거 (Tailwind 클래스에 lab() 함수 포함 가능)
      const allElements = clonedElement.querySelectorAll('*')
      allElements.forEach((el: Element) => {
        // SVGElement 등 특수 요소는 className이 읽기 전용일 수 있음
        try {
          if (el instanceof HTMLElement) {
            el.className = ''
            // 위험한 스타일 속성 제거
            if (el.style.cssText && el.style.cssText.includes('lab')) {
              el.style.cssText = ''
            }
          }
        } catch {
          // 클래스 설정 실패 무시
        }
      })

      const opt = {
        margin: 10,
        filename: `${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          allowTaint: true,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      }
      console.log('📋 PDF 옵션:', opt)
      console.log('⏳ PDF 생성 중...')

      // html2pdf는 체인 가능한 API 제공
      // 정제된 클론 요소를 사용해서 렌더링
      await html2pdfLib().set(opt).from(clonedElement).save()

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
