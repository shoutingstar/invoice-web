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
    if (element) {
      const opt = {
        margin: 10,
        filename: `${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      }
      // html2pdf.js 글로벌 변수 사용
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const htmlToPdf = (window as any).html2pdf
      htmlToPdf().set(opt).from(element).save()
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
