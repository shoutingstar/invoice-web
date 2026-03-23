/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

import { fetchInvoiceById } from '@/lib/api/notion-invoices'
import { formatAmount, formatDate } from '@/lib/format-utils'

// 간단한 PDF 생성 (pdfkit 사용)
async function createSimplePDF(invoice: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    })

    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => {
      const pdf = Buffer.concat(chunks)
      resolve(pdf)
    })
    doc.on('error', reject)

    // 제목
    doc.fontSize(24).fillColor('#1e40af').text('견적서', { align: 'left' })

    doc
      .moveTo(40, doc.y + 5)
      .lineTo(550, doc.y + 5)
      .stroke('#2563eb')
      .lineWidth(3)

    doc.moveDown(15)

    // 메타 정보
    doc.fontSize(10).fillColor('#666').text('견적 번호')
    doc
      .fontSize(12)
      .fillColor('#333')
      .text(invoice.invoiceNumber || '', { underline: false })

    doc.moveTo(300, doc.y - 12)
    doc.fontSize(10).fillColor('#666').text('작성 날짜', 300, doc.y)
    doc
      .fontSize(12)
      .fillColor('#333')
      .text(formatDate(invoice.createdDate), 300, doc.y)

    doc.moveDown(15)

    doc.fontSize(10).fillColor('#666').text('고객사명')
    doc
      .fontSize(12)
      .fillColor('#333')
      .text(invoice.customerName || '')

    doc.moveTo(300, doc.y - 12)
    doc.fontSize(10).fillColor('#666').text('상태', 300, doc.y)
    doc
      .fontSize(12)
      .fillColor('#333')
      .text(invoice.status || '', 300, doc.y)

    doc.moveDown(20)

    // 항목 테이블 헤더
    const tableTop = doc.y
    const col1 = 50
    const col2 = 400
    const col3 = 500

    doc.fillColor('#1e40af').fontSize(11).font('Helvetica-Bold')
    doc.text('Item', col1, tableTop)
    doc.text('Qty', col2, tableTop)
    doc.text('Amount', col3, tableTop)

    // 헤더 하단선
    doc
      .moveTo(40, tableTop + 15)
      .lineTo(555, tableTop + 15)
      .stroke('#2563eb')

    // 항목
    let yPos = tableTop + 25
    const items = invoice.items || []

    doc.fillColor('#333').fontSize(10).font('Helvetica')
    items.forEach((item: any) => {
      const itemName = item.itemName || ''
      const displayName = itemName.substring(0, 40) // 최대 40자

      doc.text(displayName, col1, yPos, { width: 300 })
      doc.text(
        String(item.quantity || 0),
        col2,
        yPos - (doc.heightOfString(displayName) - 12)
      )
      doc.text(
        formatAmount(item.amount || 0),
        col3 - 50,
        yPos - (doc.heightOfString(displayName) - 12)
      )

      yPos += 20
    })

    // 합계선
    doc.moveTo(40, yPos).lineTo(555, yPos).stroke('#2563eb')

    yPos += 10

    // 합계
    const total =
      items.length > 0
        ? items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
        : invoice.totalAmount || 0

    doc.fillColor('#1e40af').fontSize(12).font('Helvetica-Bold')
    doc.text('Total', col1, yPos)
    doc.text(formatAmount(total), col3 - 50, yPos)

    // 푸터 (A4 높이: 842pt)
    const pageHeight = 842
    doc
      .moveTo(40, pageHeight - 80)
      .lineTo(555, pageHeight - 80)
      .stroke('#e5e7eb')

    doc.fillColor('#666').fontSize(9)
    doc.text(
      `Generated on ${formatDate(invoice.createdDate)}`,
      40,
      pageHeight - 70
    )
    doc.text('© 2026 Invoice Web Service', 40, pageHeight - 50)

    doc.end()
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[PDF API] Generating PDF for invoice:', id)

    // 견적서 데이터 조회
    let invoice = await fetchInvoiceById(id)

    // 테스트용 더미 데이터 (Notion API 미연동 시)
    if (!invoice) {
      console.log('[PDF API] Using dummy data for testing')
      invoice = {
        id: id,
        invoiceNumber: `INV-2026-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        customerName: '테스트 회사',
        customerPhone: '010-0000-0000',
        customerEmail: 'test@example.com',
        createdDate: new Date().toISOString(),
        validUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: '대기' as const,
        managerName: '담당자',
        managerEmail: 'manager@example.com',
        managerPhone: '010-1111-1111',
        items: [
          {
            id: '1',
            order: 1,
            itemName: '웹사이트 디자인',
            quantity: 1,
            unitPrice: 5000000,
            amount: 5000000,
          },
          {
            id: '2',
            order: 2,
            itemName: '프론트엔드 개발',
            quantity: 1,
            unitPrice: 0,
            amount: 0,
          },
        ],
        totalAmount: 5000000,
      } as any
    }

    if (!invoice) {
      return NextResponse.json(
        { error: '견적서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('[PDF API] Invoice found:', invoice.invoiceNumber)

    // PDF 생성
    console.log('[PDF API] Creating PDF...')
    const pdfBuffer = await createSimplePDF(invoice)
    console.log('[PDF API] PDF generated:', pdfBuffer.length, 'bytes')

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice_${invoice.invoiceNumber}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[PDF API] Error:', error)
    return NextResponse.json(
      { error: 'PDF 생성에 실패했습니다.', details: String(error) },
      { status: 500 }
    )
  }
}
