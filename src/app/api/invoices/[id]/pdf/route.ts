/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb } from 'pdf-lib'

import { fetchInvoiceById } from '@/lib/api/notion-invoices'
import { formatAmount, formatDate } from '@/lib/format-utils'

// pdf-lib를 사용한 PDF 생성 (간단하고 안정적)
async function createPDFBuffer(invoice: any): Promise<Uint8Array> {
  try {
    // PDF 문서 생성
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842])

    const black = rgb(0, 0, 0)
    const darkBlue = rgb(0.1, 0.2, 0.6)
    const margin = 40
    let yPos = 800

    // 제목
    page.drawText('견적서', {
      x: margin,
      y: yPos,
      size: 28,
      color: darkBlue,
    })

    yPos -= 50

    // 견적 번호
    page.drawText(`견적 번호: ${invoice.invoiceNumber || ''}`, {
      x: margin,
      y: yPos,
      size: 12,
      color: black,
    })

    yPos -= 30

    // 고객사명
    page.drawText(`고객사: ${invoice.customerName || ''}`, {
      x: margin,
      y: yPos,
      size: 12,
      color: black,
    })

    yPos -= 30

    // 작성 날짜
    page.drawText(`작성 날짜: ${formatDate(invoice.createdDate)}`, {
      x: margin,
      y: yPos,
      size: 12,
      color: black,
    })

    yPos -= 50

    // 항목 제목
    page.drawText('항목 목록', {
      x: margin,
      y: yPos,
      size: 14,
      color: darkBlue,
    })

    yPos -= 30

    // 항목
    const items = invoice.items || []
    items.forEach((item: any) => {
      const itemText = `${item.itemName || ''} x${item.quantity || 0} = ${formatAmount(item.amount || 0)}`
      page.drawText(itemText, {
        x: margin + 20,
        y: yPos,
        size: 11,
        color: black,
      })
      yPos -= 25
    })

    yPos -= 20

    // 합계
    const total =
      items.length > 0
        ? items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
        : invoice.totalAmount || 0

    page.drawText('---', {
      x: margin,
      y: yPos,
      size: 11,
      color: black,
    })

    yPos -= 25

    page.drawText(`합계: ${formatAmount(total)}`, {
      x: margin,
      y: yPos,
      size: 14,
      color: darkBlue,
    })

    // PDF 저장 및 바이트 반환
    return await pdfDoc.save()
  } catch (error) {
    console.error('[createPDFBuffer] Error:', error)
    throw error
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[PDF API] Starting PDF generation for invoice:', id)

    // 견적서 데이터 조회
    let invoice
    try {
      invoice = await fetchInvoiceById(id)
      console.log('[PDF API] Invoice fetched:', invoice?.invoiceNumber)
    } catch (fetchError) {
      console.error('[PDF API] Fetch error:', fetchError)
      throw new Error(`Failed to fetch invoice: ${String(fetchError)}`)
    }

    if (!invoice) {
      return NextResponse.json(
        { error: '견적서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // PDF 생성 (pdf-lib 사용)
    console.log('[PDF API] Creating PDF buffer...')
    let pdfBytes
    try {
      pdfBytes = await createPDFBuffer(invoice)
      console.log('[PDF API] PDF created:', pdfBytes.length, 'bytes')
    } catch (createError) {
      console.error('[PDF API] Create error:', createError)
      throw new Error(`Failed to create PDF: ${String(createError)}`)
    }

    // Buffer로 변환
    const pdfBuffer = Buffer.from(pdfBytes)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice_${invoice.invoiceNumber}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[PDF API] Error:', errorMessage, error)
    return NextResponse.json(
      { error: 'PDF 생성에 실패했습니다.', details: errorMessage },
      { status: 500 }
    )
  }
}
