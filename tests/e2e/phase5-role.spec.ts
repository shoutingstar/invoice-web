/**
 * Phase 5 Task 019-017 E2E 테스트
 * 다크모드 ThemeToggle 및 역할(role) 분리 검증
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'password123'

test.describe('Phase 5 Task 019-017 - 다크모드 & 역할 분리', () => {
  // 각 테스트 전 로그인 수행
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', TEST_EMAIL)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)
  })

  test('T1: AuthHeader에 ThemeToggle 버튼 존재', async ({ page }) => {
    // ThemeToggle 버튼 확인: Sun/Moon 아이콘 또는 sr-only 텍스트로 찾기
    // ThemeToggle 드롭다운 트리거 버튼 (sr-only "테마 전환" 텍스트 포함)
    const themeToggleBtn = page
      .locator('button')
      .filter({ has: page.locator('span.sr-only', { hasText: '테마 전환' }) })
    await expect(themeToggleBtn).toBeVisible()
  })

  test('T2: 관리자 뱃지 표시', async ({ page }) => {
    // AuthHeader에 "관리자" 뱃지 텍스트 확인
    const adminBadge = page.locator('text=관리자')
    await expect(adminBadge).toBeVisible()
  })

  test('T3: 다크 모드 전환 - html에 dark 클래스 적용', async ({ page }) => {
    // ThemeToggle 버튼 클릭으로 드롭다운 열기
    const themeToggleBtn = page
      .locator('button')
      .filter({ has: page.locator('span.sr-only', { hasText: '테마 전환' }) })
    await themeToggleBtn.click()

    // 드롭다운에서 "다크" 메뉴 아이템 클릭
    const darkOption = page.locator('[role="menuitem"]', { hasText: '다크' })
    await expect(darkOption).toBeVisible()
    await darkOption.click()

    // html 요소에 "dark" 클래스가 추가되었는지 확인
    const htmlElement = page.locator('html')
    await expect(htmlElement).toHaveClass(/dark/)
  })

  test('T4: 라이트 모드 전환', async ({ page }) => {
    const themeToggleBtn = page
      .locator('button')
      .filter({ has: page.locator('span.sr-only', { hasText: '테마 전환' }) })

    // 다크 모드로 전환
    await themeToggleBtn.click()
    await page.locator('[role="menuitem"]', { hasText: '다크' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    // 드롭다운이 완전히 닫힐 때까지 대기
    await page.locator('[role="menu"]').waitFor({ state: 'hidden' })

    // 다시 ThemeToggle 클릭하여 라이트 모드로 전환
    await themeToggleBtn.click()
    const lightOption = page.locator('[role="menuitem"]', { hasText: '라이트' })
    await expect(lightOption).toBeVisible()
    await lightOption.click()

    // html 요소에서 "dark" 클래스가 제거되었는지 확인
    const htmlElement = page.locator('html')
    await expect(htmlElement).not.toHaveClass(/dark/)
  })

  test('T5: ThemeToggle이 로그아웃 버튼 왼쪽에 위치', async ({ page }) => {
    // header 내 버튼 목록에서 ThemeToggle이 로그아웃 앞에 있는지 순서 확인
    const header = page.locator('header')
    const themeToggleBtn = header
      .locator('button')
      .filter({ has: page.locator('span.sr-only', { hasText: '테마 전환' }) })
    const logoutBtn = header.locator('button', { hasText: '로그아웃' })

    await expect(themeToggleBtn).toBeVisible()
    await expect(logoutBtn).toBeVisible()

    // ThemeToggle의 bounding box가 로그아웃 버튼보다 왼쪽에 있는지 확인
    const themeBox = await themeToggleBtn.boundingBox()
    const logoutBox = await logoutBtn.boundingBox()

    expect(themeBox).not.toBeNull()
    expect(logoutBox).not.toBeNull()
    expect(themeBox!.x).toBeLessThan(logoutBox!.x)
  })
})
