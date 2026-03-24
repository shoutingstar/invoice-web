/**
 * 견적서 상세 페이지에서 PDF 다운로드 기능 테스트
 * Puppeteer 서버 사이드 PDF 생성
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'password123'

test('견적서 상세 페이지에서 PDF 다운로드 API 작동 확인', async ({ page }) => {
  // Step 1: 로그인
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input[name="email"]', TEST_EMAIL)
  await page.fill('input[name="password"]', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${BASE_URL}/dashboard`)
  console.log('✅ 로그인 완료')

  // Step 2: 견적서 목록 → 상세
  await page.goto(`${BASE_URL}/invoices`)
  await page.waitForLoadState('networkidle')

  const firstInvoiceLink = page.locator('a[href^="/invoices/"]').first()
  const isVisible = await firstInvoiceLink.isVisible().catch(() => false)

  if (!isVisible) {
    console.log('⚠️ 견적서가 없어서 테스트 건너뜀')
    return
  }

  console.log('🔗 첫 번째 견적서 링크 클릭 중...')
  const invoiceHref = await firstInvoiceLink.getAttribute('href')
  console.log(`📎 링크 주소: ${invoiceHref}`)

  // 링크를 클릭하고 새 페이지 로드 대기
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    firstInvoiceLink.click(),
  ])

  console.log('✅ 견적서 상세 페이지 로드')

  // Step 3: 현재 페이지 URL에서 invoiceId 추출
  const currentUrl = page.url()
  console.log(`🔗 현재 URL: ${currentUrl}`)
  const invoiceIdMatch = currentUrl.match(/\/invoices\/([^/]+)/)
  if (!invoiceIdMatch) {
    throw new Error(`견적서 ID를 찾을 수 없습니다 (URL: ${currentUrl})`)
  }
  const invoiceId = invoiceIdMatch[1]
  console.log(`📄 견적서 ID: ${invoiceId}`)

  // Step 4: PDF 버튼 찾기 (텍스트 검색)
  const pdfButton = page.locator('button').filter({ hasText: /PDF|다운로드/ })
  await expect(pdfButton).toBeVisible()
  console.log('✅ PDF 다운로드 버튼 발견')

  // Step 5: PDF API 직접 호출 및 검증
  console.log('🔵 PDF API 호출 중...')
  const pdfResponse = await page.request.get(
    `${BASE_URL}/api/invoices/${invoiceId}/pdf`
  )

  expect(pdfResponse.ok()).toBe(true)
  console.log(`✅ API 응답: ${pdfResponse.status()}`)

  expect(pdfResponse.headers()['content-type']).toBe('application/pdf')
  console.log('✅ Content-Type: application/pdf')

  const pdfBuffer = await pdfResponse.body()
  expect(pdfBuffer.length).toBeGreaterThan(0)
  console.log(`✅ PDF 크기: ${pdfBuffer.length} bytes`)

  // PDF 파일 서명 확인 (%PDF)
  const pdfSignature = String.fromCharCode(
    pdfBuffer[0],
    pdfBuffer[1],
    pdfBuffer[2],
    pdfBuffer[3]
  )
  expect(pdfSignature).toBe('%PDF')
  console.log('✅ PDF 파일 서명 확인: %PDF')

  console.log('✅ 모든 PDF 다운로드 검증 완료!')
})
