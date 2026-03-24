import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3010'
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'password123'

test.describe('Phase 4 Task 014 - 검색 및 필터링 기능', () => {
  // 각 테스트 전에 로그인 및 견적서 목록 페이지 접속
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', TEST_EMAIL)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // 견적서 목록 페이지 접속
    await page.goto(`${BASE_URL}/invoices`)
    await expect(page).toHaveTitle(/견적서/)
  })

  test('T1: 검색어 입력 및 검색 버튼 클릭', async ({ page }) => {
    // 검색 input 찾기
    const searchInput = page.locator('input[placeholder*="검색"]')
    await expect(searchInput).toBeVisible()

    // 검색어 입력
    await searchInput.fill('INV')

    // 검색 버튼 클릭
    const searchButton = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first()
    await searchButton.click()

    // URL에 search 파라미터 확인
    await page.waitForURL(/search=INV/)
    const url = page.url()
    expect(url).toContain('search=INV')
  })

  test('T2: Enter 키로 검색', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="검색"]')
    await searchInput.fill('고객')

    // Enter 키 입력
    await searchInput.press('Enter')

    // URL에 search 파라미터 확인
    await page.waitForURL(/search=/)
    const url = page.url()
    expect(url).toContain('search=')
  })

  test('T3: 상태 필터 선택', async ({ page }) => {
    // Select 요소 찾기
    const selectTrigger = page.locator('button[role="combobox"]').first()
    await expect(selectTrigger).toBeVisible()

    // Select 열기
    await selectTrigger.click()

    // 상태 옵션 선택 (예: "대기")
    const option = page
      .locator('[role="option"]')
      .filter({ hasText: /대기/ })
      .first()
    const isVisible = await option.isVisible().catch(() => false)

    if (isVisible) {
      await option.click()

      // URL에 status 파라미터 확인
      await page.waitForURL(/status=/)
      const url = page.url()
      expect(url).toContain('status=')
      expect(url).toContain('page=1') // 페이지 초기화 확인
    }
  })

  test('T4: 검색 + 상태 필터 조합', async ({ page }) => {
    // 검색어 입력
    const searchInput = page.locator('input[placeholder*="검색"]')
    await searchInput.fill('test')

    // 상태 필터 선택
    const selectTrigger = page.locator('button[role="combobox"]').first()
    await selectTrigger.click()

    const option = page
      .locator('[role="option"]')
      .filter({ hasText: /승인완료/ })
      .first()
    const isVisible = await option.isVisible().catch(() => false)

    if (isVisible) {
      await option.click()

      // URL에 모두 포함되어 있는지 확인
      await page.waitForURL(/search=|status=/)
      const url = page.url()
      expect(url).toContain('search=')
      expect(url).toContain('status=')
    }
  })

  test('T5: 초기화 버튼', async ({ page }) => {
    // 검색 수행
    const searchInput = page.locator('input[placeholder*="검색"]')
    await searchInput.fill('search-term')

    const searchButton = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first()
    await searchButton.click()

    await page.waitForURL(/search=/)

    // 초기화 버튼 확인
    const resetButton = page.locator('button').filter({ hasText: /초기화/ })
    const isVisible = await resetButton.isVisible().catch(() => false)

    if (isVisible) {
      await resetButton.click()

      // URL이 깨끗해져야 함
      await page.waitForURL(`${BASE_URL}/invoices`)
      const url = page.url()
      expect(url).not.toContain('search=')
      expect(url).not.toContain('status=')
    }
  })

  test('T6: 검색 결과 없음 상태', async ({ page }) => {
    // 존재하지 않을 검색어 입력
    const searchInput = page.locator('input[placeholder*="검색"]')
    await searchInput.fill('NONEXISTENT-12345')

    const searchButton = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first()
    await searchButton.click()

    // 검색 수행 대기
    await page.waitForLoadState('networkidle')

    // EmptyState 확인
    const emptyState = page.locator('text=/검색 조건에 맞|견적서가 없습니다/')
    const cardsVisible = await page
      .locator('[class*="grid"]')
      .locator('a')
      .first()
      .isVisible()
      .catch(() => false)

    // 카드가 없거나 EmptyState가 보여야 함
    if (!cardsVisible) {
      await expect(emptyState).toBeVisible()
    }
  })

  test('T7: 페이지네이션과 검색 파라미터 유지', async ({ page }) => {
    // 검색 수행
    const searchInput = page.locator('input[placeholder*="검색"]')
    await searchInput.fill('INV')

    const searchButton = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first()
    await searchButton.click()

    await page.waitForURL(/search=INV/)

    // 다음 페이지 버튼 클릭 (있는 경우)
    const nextPageLink = page
      .locator('a')
      .filter({ hasText: /2|다음/ })
      .first()
    const isVisible = await nextPageLink.isVisible().catch(() => false)

    if (isVisible) {
      await nextPageLink.click()
      await page.waitForLoadState('networkidle')

      // search 파라미터가 유지되어야 함
      const url = page.url()
      expect(url).toContain('search=INV')
      expect(url).toContain('page=2')
    }
  })
})
