import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'
import { fetchInvoiceById } from '@/lib/api/notion-invoices'
import { formatAmount, formatDate } from '@/lib/format-utils'

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

    return new NextResponse(pdfBuffer, {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generatePDF(invoice: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const passThrough = new PassThrough()
      const buffers: Buffer[] = []

      passThrough.on('data', (chunk: Buffer) => {
        buffers.push(chunk)
      })

      passThrough.on('end', () => {
        resolve(Buffer.concat(buffers))
      })

      passThrough.on('error', (err: Error) => {
        reject(err)
      })

      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
      })

      doc.pipe(passThrough)

      // 파란 헤더 박스
      doc.rect(40, 40, 500, 100).fill('#4472C4')

      // 헤더 텍스트
      doc.fillColor('white').fontSize(14).font('Helvetica-Bold')
      doc.text(`견적서 번호: ${invoice.invoiceNumber}`, 60, 55)
      doc.text(`고객: ${invoice.customerName}`, 60, 75)
      doc.text(`발행일: ${formatDate(invoice.createdDate)}`, 60, 95)
      doc.text(`유효기간: ${formatDate(invoice.validUntil)}`, 60, 115)

      // 제목
      doc.fillColor('black').fontSize(14).font('Helvetica-Bold')
      doc.text('견적 정목', 40, 160)

      // 테이블 헤더
      const tableTop = 190
      const tableWidth = 520
      const columnWidths = [150, 80, 120, 170]
      const columnPositions = [40, 190, 270, 390]

      // 헤더 배경
      doc.rect(40, tableTop, tableWidth, 25).fill('#1a1a1a')

      // 헤더 텍스트
      doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
      doc.text('품명', columnPositions[0], tableTop + 6)
      doc.text('수량', columnPositions[1], tableTop + 6, {
        width: columnWidths[1],
        align: 'center',
      })
      doc.text('단가', columnPositions[2], tableTop + 6, {
        width: columnWidths[2],
        align: 'right',
      })
      doc.text('금액', columnPositions[3], tableTop + 6, {
        width: columnWidths[3],
        align: 'right',
      })

      // 테이블 행
      let currentY = tableTop + 25
      doc.fillColor('white').fontSize(10).font('Helvetica')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      invoice.items.forEach((item: any) => {
        doc.rect(40, currentY, tableWidth, 25).fill('#1a1a1a')
        doc.fillColor('white')
        doc.text(item.itemName, columnPositions[0], currentY + 6)
        doc.text(String(item.quantity), columnPositions[1], currentY + 6, {
          width: columnWidths[1],
          align: 'center',
        })
        doc.text(
          formatAmount(item.unitPrice),
          columnPositions[2],
          currentY + 6,
          {
            width: columnWidths[2],
            align: 'right',
          }
        )
        doc.text(formatAmount(item.amount), columnPositions[3], currentY + 6, {
          width: columnWidths[3],
          align: 'right',
        })
        currentY += 25
      })

      // 합계
      doc.rect(40, currentY, tableWidth, 25).fill('#1a1a1a')
      const total =
        invoice.items.length > 0
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            invoice.items.reduce(
              (sum: number, item: any) => sum + (item.amount || 0),
              0
            )
          : invoice.totalAmount

      doc.fillColor('white').font('Helvetica-Bold')
      doc.text('합계', columnPositions[0], currentY + 6, { width: 310 })
      doc.text(formatAmount(total), columnPositions[3], currentY + 6, {
        width: columnWidths[3],
        align: 'right',
      })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}
