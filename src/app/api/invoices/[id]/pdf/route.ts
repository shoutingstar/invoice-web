import { NextRequest, NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfMake = require('pdfmake/build/pdfmake')

// 서버 환경에서는 vfs를 동적으로 설정
if (typeof window === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfFonts = require('pdfmake/build/vfs_fonts')
  if (pdfFonts && pdfFonts.pdfMake) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs
  }
}

import { fetchInvoiceById } from '@/lib/api/notion-invoices'
import { formatAmount, formatDate } from '@/lib/format-utils'
import type { Invoice, InvoiceItem } from '@/lib/types/invoice'

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
    const pdfBuffer = await generatePDF(invoice)

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="견적서_${invoice.invoiceNumber}_${invoice.createdDate}.pdf"`,
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

async function generatePDF(invoice: Invoice): Promise<Buffer> {
  // pdfmake 테이블 셀 타입
  interface PdfTableCell {
    text: string
    bold?: boolean
    color?: string
    fillColor?: string
    alignment?: 'left' | 'center' | 'right'
  }

  // 테이블 행 생성
  const tableBody: Array<
    Array<
      | PdfTableCell
      | string
      | { text: string; alignment?: string; fillColor?: string }
    >
  > = [
    [
      { text: '품명', bold: true, color: 'white', fillColor: '#1a1a1a' },
      {
        text: '수량',
        bold: true,
        color: 'white',
        fillColor: '#1a1a1a',
        alignment: 'center',
      },
      {
        text: '단가',
        bold: true,
        color: 'white',
        fillColor: '#1a1a1a',
        alignment: 'right',
      },
      {
        text: '금액',
        bold: true,
        color: 'white',
        fillColor: '#1a1a1a',
        alignment: 'right',
      },
    ],
  ]

  // 항목 행 추가
  invoice.items?.forEach((item: InvoiceItem) => {
    tableBody.push([
      item.itemName,
      { text: String(item.quantity), alignment: 'center' },
      { text: formatAmount(item.unitPrice), alignment: 'right' },
      { text: formatAmount(item.amount), alignment: 'right' },
    ])
  })

  // 합계 행 추가
  const total =
    invoice.items && invoice.items.length > 0
      ? invoice.items.reduce(
          (sum: number, item: InvoiceItem) => sum + (item.amount || 0),
          0
        )
      : invoice.totalAmount

  tableBody.push([
    { text: '합계', bold: true, color: 'white', fillColor: '#1a1a1a' },
    { text: '', fillColor: '#1a1a1a' },
    { text: '', fillColor: '#1a1a1a' },
    {
      text: formatAmount(total),
      bold: true,
      color: 'white',
      fillColor: '#1a1a1a',
      alignment: 'right',
    },
  ])

  const docDefinition = {
    content: [
      // 헤더 섹션
      {
        columns: [
          {
            width: '*',
            stack: [
              {
                text: `견적서 번호: ${invoice.invoiceNumber}`,
                fontSize: 14,
                bold: true,
              },
              {
                text: `고객: ${invoice.customerName}`,
                fontSize: 12,
                marginTop: 5,
              },
              {
                text: `발행일: ${formatDate(invoice.createdDate)}`,
                fontSize: 11,
                marginTop: 5,
              },
              {
                text: `유효기간: ${formatDate(invoice.validUntil)}`,
                fontSize: 11,
                marginTop: 5,
              },
            ],
            fillColor: '#4472C4',
            color: 'white',
            padding: 15,
          },
        ],
      },
      { text: '', marginTop: 20 },
      // 제목
      { text: '견적 정목', fontSize: 14, bold: true, marginBottom: 10 },
      // 테이블
      {
        table: {
          headerRows: 1,
          widths: ['*', 80, 100, 120],
          body: tableBody,
        },
        marginBottom: 20,
      },
    ],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
    },
    pageMargins: [40, 40, 40, 40],
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = pdfMake.createPdf(docDefinition)

      doc.getBuffer(
        (buffer: Buffer) => {
          resolve(buffer)
        },
        (error: Error) => {
          reject(error)
        }
      )
    } catch (err) {
      reject(err)
    }
  })
}
