import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { fetchInvoiceById } from '@/lib/api/notion-invoices'
import { formatAmount, formatDate } from '@/lib/format-utils'

/**
 * 견적서 PDF 다운로드
 * GET /api/invoices/[id]/pdf
 * Puppeteer 서버사이드 PDF 생성
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 인증 확인
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 견적서 조회
    const invoice = await fetchInvoiceById(id)

    if (!invoice) {
      return NextResponse.json(
        { error: '견적서를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // HTML 생성
    const html = generatePdfHtml(invoice)

    // Puppeteer로 PDF 생성
    const pdf = await generatePdf(html)

    // PDF 반환
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('❌ PDF 생성 중 오류:', error)
    return NextResponse.json(
      {
        error: 'PDF 생성 중 오류가 발생했습니다',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

interface Invoice {
  invoiceNumber: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  status?: string
  createdDate?: string
  validUntil?: string
  totalAmount?: number
  items?: InvoiceItem[]
  specialRequests?: string
}

interface InvoiceItem {
  itemName?: string
  description?: string
  quantity?: number
  unitPrice?: number
  amount?: number
}

/**
 * 견적서 HTML 생성
 */
function generatePdfHtml(invoice: Invoice): string {
  const items = invoice.items || []
  const totalAmount = invoice.totalAmount || 0

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${invoice.invoiceNumber} - 견적서</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: white;
      color: #000;
      line-height: 1.6;
      padding: 40px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #1a1a1a;
    }
    .header p {
      color: #666;
      font-size: 14px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
      padding-bottom: 40px;
      border-bottom: 1px solid #ddd;
    }
    .info-group h3 {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .info-group p {
      font-size: 14px;
      color: #333;
      margin-bottom: 4px;
    }
    .table-wrapper {
      margin-bottom: 40px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #f5f5f5;
      padding: 12px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #ddd;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
      color: #555;
    }
    .amount {
      text-align: right;
      font-family: monospace;
    }
    .summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 40px;
      padding-top: 20px;
    }
    .summary-section {
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    .summary-section h3 {
      font-size: 13px;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 12px;
      font-weight: 600;
    }
    .total-amount {
      font-size: 24px;
      font-weight: bold;
      color: #1a1a1a;
      font-family: monospace;
    }
    .note-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .note-section h3 {
      font-size: 13px;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .note-section p {
      font-size: 14px;
      color: #555;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>${invoice.invoiceNumber}</h1>
      <p>견적서</p>
    </div>

    <!-- Info Grid -->
    <div class="info-grid">
      <div>
        <div class="info-group">
          <h3>고객사명</h3>
          <p>${invoice.customerName || '-'}</p>
        </div>
        <div class="info-group">
          <h3>고객 연락처</h3>
          <p>${invoice.customerPhone || '-'}</p>
        </div>
        <div class="info-group">
          <h3>고객 이메일</h3>
          <p>${invoice.customerEmail || '-'}</p>
        </div>
      </div>
      <div>
        <div class="info-group">
          <h3>상태</h3>
          <p>${invoice.status || '-'}</p>
        </div>
        <div class="info-group">
          <h3>작성 날짜</h3>
          <p>${invoice.createdDate ? formatDate(invoice.createdDate) : '-'}</p>
        </div>
        <div class="info-group">
          <h3>유효기간</h3>
          <p>${invoice.validUntil || '-'}</p>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style="width: 50%">설명</th>
            <th style="width: 15%; text-align: right">수량</th>
            <th style="width: 15%; text-align: right">단가</th>
            <th style="width: 20%; text-align: right">합계</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item: InvoiceItem) => `
          <tr>
            <td>${item.itemName || '-'}</td>
            <td class="amount">${item.quantity || '-'}</td>
            <td class="amount">${item.unitPrice ? formatAmount(item.unitPrice) : '-'}</td>
            <td class="amount">${item.amount ? formatAmount(item.amount) : '-'}</td>
          </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- Summary -->
    <div class="summary">
      <div></div>
      <div class="summary-section">
        <h3>합계 금액</h3>
        <div class="total-amount">${formatAmount(totalAmount)}</div>
      </div>
    </div>

    ${
      invoice.specialRequests
        ? `
    <div class="note-section">
      <h3>특수 요청사항/비고</h3>
      <p>${invoice.specialRequests}</p>
    </div>
    `
        : ''
    }
  </div>
</body>
</html>
`
}

/**
 * 로컬 & Vercel 환경 모두 지원하는 PDF 생성
 * 로컬: puppeteer 내장 chromium 사용
 * Vercel: puppeteer-core + @sparticuz/chromium 사용
 */
async function generatePdf(html: string): Promise<Buffer> {
  let browser
  try {
    // 환경에 따라 다른 puppeteer 모듈 사용
    let launchOptions: Parameters<typeof import('puppeteer').launch>[0] = {
      headless: true,
    }

    if (process.env.VERCEL) {
      // Vercel 환경: puppeteer-core + @sparticuz/chromium
      const puppeteerCore = await import('puppeteer-core')
      const chromiumModule = await import('@sparticuz/chromium')
      const chromium = chromiumModule.default

      // CDN URL 명시적 지정 및 /tmp 캐싱
      const executablePath = await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v132.0.0/chromium-v132.0.0-pack.tar'
      )

      launchOptions = {
        args: [...(chromium.args || []), '--disable-dev-shm-usage'],
        defaultViewport: null,
        executablePath,
        headless: true,
      }

      browser = await puppeteerCore.launch(launchOptions)
    } else {
      // 로컬 환경: 기본 puppeteer 사용
      const puppeteerModule = await import('puppeteer')
      launchOptions = {
        headless: true,
      }
      browser = await puppeteerModule.default.launch(launchOptions)
    }

    const page = await browser.newPage()

    // HTML 로드
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    // PDF 생성
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
      printBackground: true,
    })

    await page.close()

    return Buffer.from(pdf)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
