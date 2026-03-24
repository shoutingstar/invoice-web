/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

import { fetchInvoiceById } from '@/lib/api/notion-invoices'
import { formatAmount, formatDate } from '@/lib/format-utils'

// HTML 기반 PDF 렌더링 (클라이언트사이드에서 html2pdf.js로 자동 변환)
function createPrintableHTML(invoice: any): string {
  const items = invoice.items || []
  const total =
    items.length > 0
      ? items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
      : invoice.totalAmount || 0

  const itemsHTML = items
    .map(
      (item: any) =>
        `<tr>
          <td>${item.itemName || ''}</td>
          <td class="text-center">${item.quantity || 0}</td>
          <td class="text-right">${formatAmount(item.amount || 0)}</td>
        </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>견적서 - ${invoice.invoiceNumber}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }

        #invoice-content {
            background: white;
            padding: 40px;
            margin: 0 auto;
            max-width: 800px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 32px;
            color: #1e40af;
            font-weight: bold;
        }

        .meta-grid {
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
            font-size: 12px;
            color: #666;
            font-weight: 500;
            margin-bottom: 4px;
        }

        .meta-value {
            font-size: 14px;
            color: #333;
            font-weight: 600;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }

        thead {
            background: #f8f9fa;
            border-top: 2px solid #2563eb;
            border-bottom: 2px solid #2563eb;
        }

        th {
            padding: 12px;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
            color: #1e40af;
        }

        td {
            padding: 12px;
            font-size: 13px;
            color: #333;
            border-bottom: 1px solid #e5e7eb;
        }

        tr:hover {
            background: #f8f9fa;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .total-row {
            background: #f0f4f8;
            font-weight: 600;
            color: #1e40af;
            border-top: 2px solid #2563eb;
            border-bottom: 2px solid #2563eb;
        }

        .total-row td {
            padding: 16px 12px;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            #invoice-content {
                box-shadow: none;
                max-width: 100%;
                padding: 0;
            }

            .header {
                border-bottom: 2px solid #000;
            }

            th, .total-row {
                border-color: #000;
            }

            tr:hover {
                background: white;
            }
        }
    </style>
</head>
<body>
    <div id="invoice-content">
        <div class="header">
            <h1>견적서</h1>
        </div>

        <div class="meta-grid">
            <div class="meta-item">
                <div class="meta-label">견적 번호</div>
                <div class="meta-value">${invoice.invoiceNumber || ''}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">작성 날짜</div>
                <div class="meta-value">${formatDate(invoice.createdDate)}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">고객사명</div>
                <div class="meta-value">${invoice.customerName || ''}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">상태</div>
                <div class="meta-value">${invoice.status || ''}</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>항목</th>
                    <th class="text-center">수량</th>
                    <th class="text-right">금액</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
                <tr class="total-row">
                    <td colspan="2">합계</td>
                    <td class="text-right">${formatAmount(total)}</td>
                </tr>
            </tbody>
        </table>

        <div class="footer">
            <p>Generated on ${formatDate(invoice.createdDate)}</p>
            <p>© 2026 Invoice Web Service</p>
        </div>
    </div>

    <script>
        window.addEventListener('load', () => {
            const element = document.getElementById('invoice-content');
            const opt = {
                margin: 10,
                filename: 'invoice_${invoice.invoiceNumber}.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
            };
            html2pdf().set(opt).from(element).save();
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
    console.log('[PDF API] Generating printable HTML for invoice:', id)

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

    // HTML 생성 (클라이언트에서 html2pdf.js로 자동 PDF 변환)
    console.log('[PDF API] Creating printable HTML...')
    const html = createPrintableHTML(invoice)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline', // 브라우저에서 표시 (다운로드 아님)
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[PDF API] Error:', error)
    return NextResponse.json(
      {
        error: 'PDF 생성에 실패했습니다.',
        details: String(error),
      },
      { status: 500 }
    )
  }
}
