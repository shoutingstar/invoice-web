'use client'

/**
 * 공유 페이지용 PDF 다운로드 버튼
 * Client Component로 구현되어 onClick 핸들러 사용 가능
 */

interface SharePdfButtonProps {
  invoiceNumber: string
}

export function SharePdfButton({ invoiceNumber }: SharePdfButtonProps) {
  const handleDownloadPdf = () => {
    const element = document.getElementById('invoice-detail-container')
    if (!element) {
      alert('견적서를 찾을 수 없습니다.')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const htmlToPdf = (window as any).html2pdf
    if (!htmlToPdf) {
      alert(
        'PDF 라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.'
      )
      return
    }

    try {
      const opt = {
        margin: 10,
        filename: `${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      }
      htmlToPdf().set(opt).from(element).save()
    } catch (error) {
      console.error('PDF 다운로드 오류:', error)
      alert('PDF 다운로드 중 오류가 발생했습니다.')
    }
  }

  return (
    <button
      onClick={handleDownloadPdf}
      className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
    >
      📥 PDF 다운로드
    </button>
  )
}
