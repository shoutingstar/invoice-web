/**
 * 공유 페이지 PDF 다운로드 기능 테스트
 * Puppeteer 서버 사이드 PDF 생성
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'password123'

test('공유 페이지에서 PDF 다운로드 API 작동 확인', async ({ page }) => {
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
  await firstInvoiceLink.click()
  await page.waitForLoadState('networkidle')
  console.log('✅ 견적서 상세 페이지 로드')

  // Step 3: 공유 링크 생성
  let shareUrl = ''
  let shareToken = ''

  page.on('response', async response => {
    if (
      response.url().includes('/api/invoices/') &&
      response.url().includes('/share') &&
      response.request().method() === 'POST'
    ) {
      const body = (await response.json()) as { shareUrl?: string }
      if (body.shareUrl) {
        shareUrl = body.shareUrl
        // URL에서 token 추출: /share/{token}
        const match = body.shareUrl.match(/\/share\/([^\/]+)/)
        if (match) {
          shareToken = match[1]
        }
      }
    }
  })

  const shareBtn = page.locator('button', { hasText: '공유' })
  await shareBtn.click()
  const copyLink = page.locator('[role="menuitem"]:has-text("링크 복사")')
  await copyLink.click()
  await page.waitForTimeout(1500)
  console.log(`✅ 공유 링크 생성`)
  console.log(`   Token: ${shareToken.substring(0, 20)}...`)

  // Step 4: 로그아웃
  const logoutBtn = page
    .locator('header')
    .locator('button', { hasText: '로그아웃' })
  await logoutBtn.click()
  await page.waitForURL(`${BASE_URL}/login`)
  console.log('✅ 로그아웃')

  // Step 5: 공유 페이지 접근 및 PDF 버튼 확인
  await page.goto(shareUrl)
  await page.waitForLoadState('networkidle')
  console.log('✅ 공유 페이지 로드')

  const pdfBtn = page.locator('button', { hasText: 'PDF 다운로드' })
  await expect(pdfBtn).toBeVisible()
  console.log('✅ PDF 다운로드 버튼 발견')

  // Step 6: PDF API 직접 호출 및 검증
  console.log('🔵 PDF API 호출 중...')
  const pdfResponse = await fetch(`${BASE_URL}/api/share/${shareToken}/pdf`)

  expect(pdfResponse.ok).toBe(true)
  console.log(`✅ API 응답: ${pdfResponse.status}`)

  expect(pdfResponse.headers.get('content-type')).toBe('application/pdf')
  console.log('✅ Content-Type: application/pdf')

  const pdfBuffer = await pdfResponse.arrayBuffer()
  expect(pdfBuffer.byteLength).toBeGreaterThan(0)
  console.log(`✅ PDF 크기: ${pdfBuffer.byteLength} bytes`)

  // PDF 파일 서명 확인 (%PDF)
  const uint8Array = new Uint8Array(pdfBuffer)
  const pdfSignature = String.fromCharCode(
    uint8Array[0],
    uint8Array[1],
    uint8Array[2],
    uint8Array[3]
  )
  expect(pdfSignature).toBe('%PDF')
  console.log('✅ PDF 파일 서명 확인: %PDF')

  console.log('✅ 모든 PDF 다운로드 검증 완료!')
})
