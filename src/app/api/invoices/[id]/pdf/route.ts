/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

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

    // HTML 생성
    const html = generateInvoiceHTML(invoice)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('데이터 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(invoice: any): string {
  const total =
    invoice.items && invoice.items.length > 0
      ? invoice.items.reduce(
          (sum: number, item: any) => sum + (item.amount || 0),
          0
        )
      : invoice.totalAmount

  const itemRows = invoice.items
    ?.map(
      (item: any) =>
        `
    <tr>
      <td>${item.itemName}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${formatAmount(item.unitPrice)}</td>
      <td style="text-align: right;">${formatAmount(item.amount)}</td>
    </tr>
  `
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      background: white;
    }
    .header {
      background-color: #4472C4;
      color: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .header h1 { font-size: 16px; margin-bottom: 8px; }
    .header p { font-size: 12px; margin: 4px 0; }
    .title {
      font-size: 14px;
      font-weight: bold;
      margin: 20px 0 15px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background-color: #1a1a1a;
      color: white;
      padding: 10px;
      text-align: left;
      font-size: 11px;
      font-weight: bold;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
      font-size: 11px;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .total-row {
      background-color: #1a1a1a;
      color: white;
      font-weight: bold;
    }
    #download-btn {
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #4472C4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    #download-btn:hover {
      background-color: #3559a3;
    }
    @media print {
      body { padding: 0; }
      #download-btn { display: none; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  <div id="content">
    <div class="header">
      <h1>Invoice: ${invoice.invoiceNumber}</h1>
      <p><strong>Customer:</strong> ${invoice.customerName}</p>
      <p><strong>Date:</strong> ${formatDate(invoice.createdDate)}</p>
      <p><strong>Valid Until:</strong> ${formatDate(invoice.validUntil)}</p>
    </div>

    <div class="title">Quote Details</div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <tr class="total-row">
          <td colspan="3" style="text-align: right;">Total:</td>
          <td style="text-align: right;">${formatAmount(total)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <button id="download-btn">PDF 다운로드</button>

  <script>
    document.getElementById('download-btn').addEventListener('click', function() {
      const element = document.getElementById('content');
      const opt = {
        margin: 10,
        filename: 'quote_${invoice.invoiceNumber}.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };
      html2pdf().set(opt).from(element).save();
    });
  </script>
</body>
</html>
  `
}
