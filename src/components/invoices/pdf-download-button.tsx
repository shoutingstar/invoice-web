'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { Invoice } from '@/lib/types/invoice'

interface PDFDownloadButtonProps {
  invoice: Invoice
}

/**
 * 견적서를 PDF로 다운로드하는 버튼
 * DOM을 캡처하여 PDF 생성
 */
export function PDFDownloadButton({ invoice }: PDFDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true)

      // 인쇄용 콘텐츠 영역 찾기
      const printContent = document.getElementById('invoice-print-layout')
      if (!printContent) {
        alert('PDF 콘텐츠를 찾을 수 없습니다.')
        return
      }

      // DOM을 캔버스로 변환
      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })

      // PDF 생성 (A4 크기)
      const pdf = new jsPDF({
        format: 'a4',
        orientation: 'portrait',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      // 여러 페이지에 걸쳐 이미지 추가
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      // 파일명: 견적서_[견적번호]_[작성날짜].pdf
      const fileName = `견적서_${invoice.invoiceNumber}_${invoice.createdDate}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('PDF 생성 실패:', error)
      alert('PDF 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleDownloadPDF}
      disabled={isLoading}
      className="gap-2 sm:self-start"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isLoading ? 'PDF 생성 중...' : 'PDF 다운로드'}
    </Button>
  )
}
