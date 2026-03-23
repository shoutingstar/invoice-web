/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

import { fetchInvoiceById } from '@/lib/api/notion-invoices'
import { formatAmount, formatDate } from '@/lib/format-utils'

// HTML 기반 PDF 생성 (브라우저 렌더링)
function createPrintableHTML(invoice: any): string {
  const total =
    invoice.items && invoice.items.length > 0
      ? invoice.items.reduce(
          (sum: number, item: any) => sum + (item.amount || 0),
          0
        )
      : invoice.totalAmount

  const itemsHTML = (invoice.items || [])
    .map(
      (item: any) =>
        `<tr>
          <td>${item.itemName}</td>
          <td style="text-align: right;">${item.quantity}</td>
          <td style="text-align: right;">${formatAmount(item.amount)}</td>
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      padding: 20px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    h1 {
      font-size: 28px;
      margin-bottom: 20px;
      color: #1e40af;
    }

    .invoice-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
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

    .table-wrapper {
      margin: 30px 0;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    thead {
      background-color: #f3f4f6;
      border-bottom: 2px solid #e5e7eb;
    }

    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      font-size: 13px;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    tbody tr:hover {
      background-color: #f9fafb;
    }

    .total-row {
      background-color: #eff6ff;
      font-weight: 600;
      border-top: 2px solid #2563eb;
      font-size: 16px;
    }

    .total-row td {
      padding: 16px 12px;
      border-bottom: 2px solid #2563eb;
    }

    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #666;
      font-size: 12px;
      text-align: center;
    }

    @media print {
      body {
        background-color: white;
        padding: 0;
      }

      .container {
        max-width: 100%;
        margin: 0;
        padding: 20mm;
        box-shadow: none;
      }

      header {
        border-bottom: 2px solid #000;
      }

      h1 {
        color: #000;
      }

      .total-row {
        background-color: transparent;
        border-top: 1px solid #000;
        border-bottom: 2px solid #000;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📋 견적서</h1>
    </header>

    <div class="invoice-meta">
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

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style="width: 50%;">항목명</th>
            <th style="width: 25%; text-align: right;">수량</th>
            <th style="width: 25%; text-align: right;">금액</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
          <tr class="total-row">
            <td colspan="2" style="text-align: right;">합계</td>
            <td style="text-align: right;">${formatAmount(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer>
      <p>이 견적서는 ${formatDate(invoice.createdDate)}에 작성되었습니다.</p>
      <p style="margin-top: 8px;">© 2026 Invoice Web Service</p>
    </footer>
  </div>

  <script>
    // 페이지 로드 완료 후 인쇄 대화창 표시
    window.addEventListener('load', () => {
      window.print();
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

    // 견적서 데이터 조회
    const invoice = await fetchInvoiceById(id)
    if (!invoice) {
      return NextResponse.json(
        { error: '견적서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // HTML 생성 (브라우저 렌더링 후 인쇄/PDF 저장)
    const html = createPrintableHTML(invoice)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    })
  } catch (error) {
    console.error('견적서 생성 오류:', error)
    return NextResponse.json(
      { error: '견적서 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
