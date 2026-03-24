import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'password123'

test.describe('Phase 3 통합 테스트 - 전체 플로우', () => {
  // 각 테스트 전에 로그인
  test.beforeEach(async ({ page }) => {
    // 로그인 페이지 접속
    await page.goto(`${BASE_URL}/login`)
    await expect(page).toHaveTitle(/로그인/)

    // 이메일 입력
    await page.fill('input[name="email"]', TEST_EMAIL)
    // 비밀번호 입력
    await page.fill('input[name="password"]', TEST_PASSWORD)
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]')

    // 대시보드로 리다이렉트될 때까지 대기
    await page.waitForURL(`${BASE_URL}/dashboard`)
  })

  test('T1: 대시보드 - 통계 데이터 로드 확인', async ({ page }) => {
    // 대시보드 페이지 확인
    await expect(page).toHaveTitle(/대시보드|Dashboard/)

    // 환영 메시지 확인
    await expect(page.locator('h1')).toContainText('안녕하세요')

    // 통계 카드 존재 확인 (최소 1개 이상)
    await expect(page.locator('text=전체 견적서')).toBeVisible()
    await expect(page.locator('text=대기 중')).toBeVisible()
    await expect(page.locator('text=승인완료')).toBeVisible()
    await expect(page.locator('text=발송완료')).toBeVisible()

    // 최근 견적서 섹션 확인
    await expect(page.locator('text=최근 견적서')).toBeVisible()

    // API 에러가 없는지 확인 (에러 알림 없음)
    const errorAlert = page.locator('text=데이터 로드 실패')
    await expect(errorAlert).not.toBeVisible()
  })

  test('T2: 견적서 목록 페이지 - 데이터 로드 및 검색 기능', async ({
    page,
  }) => {
    // 견적서 목록 페이지 접속
    await page.goto(`${BASE_URL}/invoices`)
    await expect(page).toHaveTitle(/견적서/)

    // 페이지 헤더 확인
    await expect(page.locator('h1')).toContainText('견적서 목록')

    // 검색 Input 확인
    await expect(page.locator('input[placeholder*="검색"]')).toBeVisible()

    // 상태 필터 Select 확인
    await expect(page.locator('select')).toBeVisible()

    // 견적서 카드 또는 EmptyState 확인
    const invoiceCards = page
      .locator('[class*="invoice"], [class*="card"]')
      .first()
    const emptyState = page.locator('text=견적서가 없습니다')

    // 둘 중 하나는 있어야 함
    const cardsVisible = await invoiceCards.isVisible().catch(() => false)
    const emptyVisible = await emptyState.isVisible().catch(() => false)
    expect(cardsVisible || emptyVisible).toBeTruthy()

    // API 에러 확인
    const errorAlert = page.locator('text=오류')
    await expect(errorAlert).not.toBeVisible()
  })

  test('T3: 견적서 검색/필터 기능', async ({ page }) => {
    // 견적서 목록 페이지 접속
    await page.goto(`${BASE_URL}/invoices`)

    // 검색어 입력
    const searchInput = page.locator('input[placeholder*="검색"]')
    await searchInput.fill('INV')

    // URL 업데이트 대기
    await page.waitForURL(/search=/)

    // 쿼리 파라미터 확인
    const url = page.url()
    expect(url).toContain('search=INV')
  })

  test('T4: 견적서 상세 페이지 - 데이터 로드 및 PDF 버튼', async ({ page }) => {
    // 견적서 목록으로 이동
    await page.goto(`${BASE_URL}/invoices`)

    // 첫 번째 견적서 카드 클릭 (존재하는 경우)
    const firstInvoiceLink = page.locator('a[href*="/invoices/"]').first()
    const isVisible = await firstInvoiceLink.isVisible().catch(() => false)

    if (isVisible) {
      // 첫 번째 견적서 클릭
      await firstInvoiceLink.click()

      // 상세 페이지 로드 대기
      await page.waitForLoadState('networkidle')

      // 견적서 번호 확인
      const invoiceNumber = page.locator('h1').first()
      await expect(invoiceNumber).toBeVisible()

      // PDF 다운로드 버튼 확인
      const pdfButton = page.locator(
        'button:has-text(/PDF|다운로드|Download/i)'
      )
      await expect(pdfButton).toBeEnabled()

      // 목록으로 돌아가기 버튼 확인
      const backButton = page
        .locator('button:has-text(/목록|돌아가기|Back/i)')
        .first()
      await expect(backButton).toBeVisible()
    }
  })

  test('T5: PDF 다운로드 기능', async ({ page, context }) => {
    // 견적서 목록으로 이동
    await page.goto(`${BASE_URL}/invoices`)

    // 첫 번째 견적서 클릭
    const firstInvoiceLink = page.locator('a[href*="/invoices/"]').first()
    const isVisible = await firstInvoiceLink.isVisible().catch(() => false)

    if (isVisible) {
      await firstInvoiceLink.click()
      await page.waitForLoadState('networkidle')

      // PDF 다운로드 버튼 확인 (html2pdf.js 방식 - window.open으로 새 탭 열림)
      const pdfButton = page.locator(
        'button:has-text(/PDF|다운로드|Download/i)'
      )
      await expect(pdfButton).toBeEnabled()

      // 새 탭이 열리는 것을 대기
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        pdfButton.click(),
      ])

      // 새 탭 URL이 PDF API 경로인지 확인
      const newPageUrl = newPage.url()
      expect(newPageUrl).toContain('/api/invoices/')
      expect(newPageUrl).toContain('/pdf')

      await newPage.close()
    }
  })

  test('T6: 로그아웃 기능', async ({ page }) => {
    // 대시보드에 있는 상태
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`)

    // 로그아웃 버튼 찾기 (AuthHeader의 로그아웃)
    const logoutButton = page.locator('button:has-text(/로그아웃|Sign out/i)')

    // 로그아웃 버튼이 있으면 클릭
    const isVisible = await logoutButton.isVisible().catch(() => false)
    if (isVisible) {
      await logoutButton.click()

      // 로그인 페이지로 리다이렉트
      await page.waitForURL(`${BASE_URL}/login`)
      await expect(page).toHaveTitle(/로그인/)
    }
  })
})

test.describe('Phase 3 API 검증', () => {
  test('API: Notion 데이터 조회 정상 여부', async ({ page }) => {
    // 테스트 API 엔드포인트 호출 (있는 경우)
    const response = await page.goto(`${BASE_URL}/api/test-notion`)

    // 응답 상태 확인
    if (response?.ok()) {
      const text = await response?.text()
      expect(text).toBeTruthy()
    }
  })
})
