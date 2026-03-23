/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

import { fetchInvoiceById } from '@/lib/api/notion-invoices'
import { formatAmount, formatDate } from '@/lib/format-utils'

// HTML 기반 PDF 생성 (클라이언트사이드 html2pdf.js 사용)
function createPrintableHTML(invoice: any): string {
  const total =
    invoice.items && invoice.items.length > 0
      ? invoice.items.reduce(
          (sum: number, item: any) => sum + (item.amount || 0),
          0
        )
      : invoice.totalAmount || 0

  const itemsHTML = (invoice.items || [])
    .map(
      (item: any) =>
        `<tr>
          <td class="item-name">${item.itemName}</td>
          <td class="item-qty">${item.quantity}</td>
          <td class="item-amount">${formatAmount(item.amount)}</td>
        </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>견적서 - ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "맑은 고딕", sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 32px;
      color: #1e40af;
      margin-bottom: 10px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 15px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 30px 0;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-weight: 600;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .meta-value {
      font-size: 16px;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    thead {
      background: #f3f4f6;
      border-bottom: 2px solid #2563eb;
    }
    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #1e40af;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .item-qty, .item-amount { text-align: right; }
    .total-row {
      background: #eff6ff;
      border-top: 2px solid #2563eb;
      border-bottom: 2px solid #2563eb;
      font-weight: 600;
    }
    .total-row td { padding: 16px 12px; }
    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #666;
      font-size: 12px;
      text-align: center;
    }
    @media print {
      * { margin: 0; padding: 0; }
      body { background: white; padding: 0; }
      .invoice-container { max-width: 100%; margin: 0; padding: 20mm; box-shadow: none; page-break-after: avoid; }
      h1 { border-bottom: 3px solid #000; page-break-after: avoid; }
      table { page-break-inside: avoid; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body id="invoice-content">
  <div class="invoice-container">
    <h1>📋 견적서</h1>

    <div class="meta-grid">
      <div class="meta-item">
        <div class="meta-label">견적 번호</div>
        <div class="meta-value">${invoice.invoiceNumber}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">작성 날짜</div>
        <div class="meta-value">${formatDate(invoice.createdDate)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">고객사명</div>
        <div class="meta-value">${invoice.customerName}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">상태</div>
        <div class="meta-value">${invoice.status}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>항목명</th>
          <th>수량</th>
          <th>금액</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
        <tr class="total-row">
          <td colspan="2">합계</td>
          <td class="item-amount">${formatAmount(total)}</td>
        </tr>
      </tbody>
    </table>

    <footer>
      <p>이 견적서는 ${formatDate(invoice.createdDate)}에 작성되었습니다.</p>
      <p>© 2026 Invoice Web Service</p>
    </footer>
  </div>

  <script>
    // 페이지 로드 후 인쇄 대화창 표시 (사용자가 "PDF로 저장" 선택)
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[PDF API] Fetching invoice:', id)

    // 견적서 데이터 조회
    const invoice = await fetchInvoiceById(id)
    if (!invoice) {
      return NextResponse.json(
        { error: '견적서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('[PDF API] Invoice found:', invoice.invoiceNumber)

    // HTML 생성 (클라이언트사이드 html2pdf.js로 PDF 변환)
    const html = createPrintableHTML(invoice)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
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
