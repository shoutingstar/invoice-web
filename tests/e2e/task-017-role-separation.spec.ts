import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const ADMIN_EMAIL = 'test@example.com'
const ADMIN_PASSWORD = 'password123'
const CLIENT_EMAIL = 'client@example.com'
const CLIENT_PASSWORD = 'password123'

test.describe('Task 017: 관리자/클라이언트 역할 분리', () => {
  // ================== 관리자 계정 테스트 ==================

  test.describe('관리자 계정 (test@example.com)', () => {
    test.beforeEach(async ({ page }) => {
      // 관리자 로그인
      await page.goto(`${BASE_URL}/login`)
      await page.fill('input[name="email"]', ADMIN_EMAIL)
      await page.fill('input[name="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL(`${BASE_URL}/dashboard`)
    })

    test('T1: 대시보드에서 관리자 뱃지 표시 확인', async ({ page }) => {
      // 관리자 뱃지가 보이는지 확인 (정확한 선택자 사용)
      const adminBadge = page.locator('[data-slot="badge"]:has-text("관리자")')
      await expect(adminBadge).toBeVisible()

      console.log('✅ T1 통과: 관리자 뱃지 표시됨')
    })

    test('T2: 대시보드에서 관리자 메뉴 섹션 표시 확인', async ({ page }) => {
      // 관리자 메뉴 제목 확인
      const adminMenuHeader = page.locator('h2:has-text("관리자 메뉴")')
      await expect(adminMenuHeader).toBeVisible()

      // 공유 링크 관리 카드 확인
      const shareCard = page.locator(
        '[data-slot="card-title"]:has-text("공유 링크 관리")'
      )
      await expect(shareCard).toBeVisible()

      // 설정 카드 확인
      const settingsCard = page.locator(
        '[data-slot="card-title"]:has-text("설정")'
      )
      await expect(settingsCard).toBeVisible()

      console.log('✅ T2 통과: 관리자 메뉴 섹션 표시됨')
    })

    test('T3: /admin 페이지 접근 가능 확인', async ({ page }) => {
      // /admin 페이지로 이동
      await page.goto(`${BASE_URL}/admin`)

      // 관리자 페이지 제목 확인
      const adminTitle = page.locator('text=관리자 페이지')
      await expect(adminTitle).toBeVisible()

      // 로그인 정보 카드 확인
      const loginInfoCard = page.locator('text=로그인 정보')
      await expect(loginInfoCard).toBeVisible()

      // 역할이 "관리자"로 표시되는지 확인
      const adminRole = page.locator('text=관리자').first()
      await expect(adminRole).toBeVisible()

      console.log('✅ T3 통과: /admin 페이지 접근 가능')
    })

    test('T4: ThemeToggle 버튼이 관리자 헤더에 존재', async ({ page }) => {
      // ThemeToggle 버튼 확인 (햇빛/달 아이콘)
      const themeToggle = page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .nth(1)
      await expect(themeToggle).toBeVisible()

      console.log('✅ T4 통과: ThemeToggle 버튼 존재')
    })
  })

  // ================== 클라이언트 계정 테스트 ==================

  test.describe('클라이언트 계정 (client@example.com)', () => {
    test.beforeEach(async ({ page }) => {
      // 클라이언트 로그인
      await page.goto(`${BASE_URL}/login`)
      await page.fill('input[name="email"]', CLIENT_EMAIL)
      await page.fill('input[name="password"]', CLIENT_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL(`${BASE_URL}/dashboard`)
    })

    test('T5: 대시보드에서 관리자 뱃지 안 보이기', async ({ page }) => {
      // 관리자 뱃지가 안 보이는지 확인
      const adminBadge = page.locator('text=관리자')
      await expect(adminBadge).not.toBeVisible()

      console.log('✅ T5 통과: 클라이언트는 관리자 뱃지 미표시')
    })

    test('T6: 대시보드에서 관리자 메뉴 섹션 안 보이기', async ({ page }) => {
      // 관리자 메뉴 제목이 안 보이는지 확인
      const adminMenuHeader = page.locator('text=관리자 메뉴')
      await expect(adminMenuHeader).not.toBeVisible()

      console.log('✅ T6 통과: 클라이언트는 관리자 메뉴 미표시')
    })

    test('T7: /admin 페이지 접근 불가능 (404 표시)', async ({ page }) => {
      // /admin 페이지로 이동 시도
      await page.goto(`${BASE_URL}/admin`)

      // 404 페이지가 표시되는지 확인
      const notFoundText = page.locator('text=/찾을 수 없음|Not Found/')
      const isNotFound = await notFoundText.isVisible().catch(() => false)

      // 또는 대시보드로 리다이렉트될 수도 있음
      const url = page.url()
      const isDashboard = url.includes('/dashboard')

      // 둘 중 하나는 참이어야 함
      expect(isNotFound || isDashboard).toBeTruthy()

      console.log('✅ T7 통과: 클라이언트는 /admin 접근 불가')
    })

    test('T8: 클라이언트는 정상적으로 견적서 목록 접근 가능', async ({
      page,
    }) => {
      // 견적서 목록 페이지로 이동
      await page.goto(`${BASE_URL}/invoices`)

      // 견적서 페이지 확인
      await expect(page).toHaveTitle(/견적서/)

      // 검색 input이 보이는지 확인
      const searchInput = page.locator('input[placeholder*="검색"]')
      await expect(searchInput).toBeVisible()

      console.log('✅ T8 통과: 클라이언트는 견적서 목록 접근 가능')
    })
  })

  // ================== 통합 테스트 ==================

  test('T9: 로그아웃 후 다시 로그인하면 역할 유지', async ({ page }) => {
    // 관리자로 로그인
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // 관리자 뱃지 확인
    let adminBadge = page.locator('[data-slot="badge"]:has-text("관리자")')
    await expect(adminBadge).toBeVisible()

    // 로그아웃
    const logoutButton = page
      .locator('button')
      .filter({
        has: page.locator('text=/로그아웃|Sign out/i'),
      })
      .first()
    await logoutButton.click()
    await page.waitForURL(`${BASE_URL}/login`)

    // 다시 로그인
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // 여전히 관리자 뱃지 표시되는지 확인
    adminBadge = page.locator('[data-slot="badge"]:has-text("관리자")')
    await expect(adminBadge).toBeVisible()

    console.log('✅ T9 통과: 로그인 후 역할 유지됨')
  })
})
