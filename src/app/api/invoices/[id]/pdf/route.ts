/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

import { fetchInvoiceById } from '@/lib/api/notion-invoices'
import { formatAmount, formatDate } from '@/lib/format-utils'

// 간단한 PDF 생성 (텍스트 기반)
function createSimplePDF(invoice: any): Buffer {
  const lines: string[] = []

  // PDF 헤더
  lines.push('%PDF-1.4')
  lines.push('1 0 obj')
  lines.push('<< /Type /Catalog /Pages 2 0 R >>')
  lines.push('endobj')
  lines.push('2 0 obj')
  lines.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  lines.push('endobj')
  lines.push('3 0 obj')
  lines.push(
    '<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>'
  )
  lines.push('endobj')
  lines.push('4 0 obj')
  lines.push(
    '<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>'
  )
  lines.push('endobj')

  // PDF 컨텐츠
  const content: string[] = []
  content.push('BT')
  content.push('/F1 12 Tf')
  content.push('50 750 Td')
  content.push(`(Invoice: ${invoice.invoiceNumber}) Tj`)
  content.push('0 -20 Td')
  content.push(`(Customer: ${invoice.customerName}) Tj`)
  content.push('0 -20 Td')
  content.push(`(Date: ${formatDate(invoice.createdDate)}) Tj`)
  content.push('0 -30 Td')
  content.push('/F1 10 Tf')

  // 항목 목록
  let yPos = -30
  invoice.items?.forEach((item: any, idx: number) => {
    content.push(`${yPos} Td`)
    content.push(
      `(${item.itemName} x${item.quantity} = ${formatAmount(item.amount)}) Tj`
    )
    yPos = -20
  })

  // 합계
  const total =
    invoice.items && invoice.items.length > 0
      ? invoice.items.reduce(
          (sum: number, item: any) => sum + (item.amount || 0),
          0
        )
      : invoice.totalAmount

  content.push(`${yPos + 10} Td`)
  content.push('/F1 12 Tf')
  content.push(`(Total: ${formatAmount(total)}) Tj`)
  content.push('ET')

  const contentStr = content.join('\n')
  lines.push('5 0 obj')
  lines.push(`<< /Length ${contentStr.length} >>`)
  lines.push('stream')
  lines.push(contentStr)
  lines.push('endstream')
  lines.push('endobj')

  // Xref 테이블
  const xrefPos = lines.join('\n').length
  lines.push('xref')
  lines.push('0 6')
  lines.push('0000000000 65535 f')
  lines.push('0000000009 00000 n')
  lines.push('0000000058 00000 n')
  lines.push('0000000115 00000 n')
  lines.push('0000000229 00000 n')
  lines.push(`${String(xrefPos).padStart(10, '0')} 00000 n`)

  lines.push('trailer')
  lines.push('<< /Size 6 /Root 1 0 R >>')
  lines.push('startxref')
  lines.push(String(xrefPos))
  lines.push('%%EOF')

  const pdfContent = lines.join('\n')
  return Buffer.from(pdfContent, 'utf-8')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 견적서 데이터 조회
    const invoice = await fetchInvoiceById(id)
    if (!invoice) {
      return NextResponse.json(
        { error: '견적서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // PDF 생성
    const pdfBuffer = createSimplePDF(invoice)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote_${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF 생성 오류:', error)
    return NextResponse.json(
      { error: 'PDF 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
