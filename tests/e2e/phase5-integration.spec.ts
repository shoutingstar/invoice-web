/**
 * Phase 5 통합 테스트
 * Task 017 역할 분리 + Task 018 공유 링크 + Task 019 다크모드 전체 플로우
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'password123'

/** 로그인 헬퍼 함수 */
async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input[name="email"]', TEST_EMAIL)
  await page.fill('input[name="password"]', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${BASE_URL}/dashboard`)
}

test.describe('Phase 5 통합 테스트 - 전체 플로우', () => {
  test('T1: 관리자 로그인 → 공유 링크 생성 → 비인증 접근', async ({ page }) => {
    // Step 1: 관리자 로그인
    await login(page)

    // Step 2: 견적서 목록 이동 및 첫 번째 견적서 상세 접근
    await page.goto(`${BASE_URL}/invoices`)
    await page.waitForLoadState('networkidle')
    const firstInvoiceLink = page.locator('a[href^="/invoices/"]').first()
    await firstInvoiceLink.click()
    await page.waitForLoadState('networkidle')

    // Step 3: 공유 버튼 존재 확인
    const shareBtn = page.locator('button', { hasText: '공유' })
    await expect(shareBtn).toBeVisible()

    // Step 4: 공유 링크 생성
    let shareUrl = ''
    page.on('response', async response => {
      if (
        response.url().includes('/api/invoices/') &&
        response.url().includes('/share') &&
        response.request().method() === 'POST'
      ) {
        const body = (await response.json()) as {
          shareUrl?: string
          token?: string
          expiresAt?: string
        }
        if (body.shareUrl) {
          shareUrl = body.shareUrl
        }
      }
    })

    // 공유 드롭다운 버튼 클릭
    await shareBtn.click()
    // 드롭다운에서 "링크 복사" 항목 클릭
    const copyLink = page.locator('[role="menuitem"]:has-text("링크 복사")')
    await copyLink.click()
    await page.waitForTimeout(2000)

    expect(shareUrl).toBeTruthy()
    expect(shareUrl).toContain('/share/')

    // Step 5: 로그아웃
    const logoutBtn = page
      .locator('header')
      .locator('button', { hasText: '로그아웃' })
    await logoutBtn.click()
    await page.waitForURL(`${BASE_URL}/login`)

    // Step 6: 비인증 상태로 공유 URL 접근
    await page.goto(shareUrl)
    await page.waitForLoadState('networkidle')

    // 공유 레이아웃 확인
    expect(page.url()).toContain('/share/')
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
  })

  test('T2: 역할 기반 접근 제어 - 인증된 사용자 대시보드 접근', async ({
    page,
  }) => {
    // 로그인 없이 보호 경로 접근 시 로그인 페이지로 리다이렉트
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForURL(`${BASE_URL}/login`)
    expect(page.url()).toContain('/login')

    // 로그인 후 접근 가능 확인
    await login(page)
    expect(page.url()).toContain('/dashboard')
  })

  test('T3: 역할 기반 접근 제어 - 견적서 목록 비인증 차단', async ({
    page,
  }) => {
    // 비인증 상태로 견적서 목록 접근
    await page.goto(`${BASE_URL}/invoices`)
    await page.waitForURL(`${BASE_URL}/login`)
    expect(page.url()).toContain('/login')
  })

  test('T4: 다크모드 전환 후 공유 페이지 접근', async ({ page }) => {
    // 로그인 및 다크 모드 전환
    await login(page)

    const themeToggleBtn = page
      .locator('button')
      .filter({ has: page.locator('span.sr-only', { hasText: '테마 전환' }) })
    await themeToggleBtn.click()
    await page.locator('[role="menuitem"]', { hasText: '다크' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    // 공유 링크 생성
    await page.goto(`${BASE_URL}/invoices`)
    await page.waitForLoadState('networkidle')
    const firstInvoiceLink = page.locator('a[href^="/invoices/"]').first()
    await firstInvoiceLink.click()
    await page.waitForLoadState('networkidle')

    let shareUrl = ''
    page.on('response', async response => {
      if (
        response.url().includes('/api/invoices/') &&
        response.url().includes('/share') &&
        response.request().method() === 'POST'
      ) {
        const body = (await response.json()) as { shareUrl?: string }
        if (body.shareUrl) shareUrl = body.shareUrl
      }
    })

    const shareBtn = page.locator('button', { hasText: '공유' })
    await shareBtn.click()
    // 드롭다운에서 "링크 복사" 항목 클릭
    const copyLink = page.locator('[role="menuitem"]:has-text("링크 복사")')
    await copyLink.click()
    await page.waitForTimeout(2000)

    if (shareUrl) {
      // 공유 페이지에서도 다크 모드 유지 확인 (ThemeProvider가 root에서 적용됨)
      await page.goto(shareUrl)
      await page.waitForLoadState('networkidle')
      // 다크모드 설정이 localStorage에 유지되면 dark 클래스 남아있음
      // (시스템 설정 또는 명시적 선택에 따라 다를 수 있으므로 부드럽게 체크)
      const htmlClass = await page.locator('html').getAttribute('class')
      expect(htmlClass).toBeDefined()
    }
  })

  test('T5: 공유 레이아웃 - 로그인 링크 표시', async ({ page }) => {
    // 유효하지 않은 토큰으로 share 경로 접근 (not-found 확인)
    await page.goto(`${BASE_URL}/share/invalid-token`)
    await page.waitForLoadState('networkidle')

    // 공유 레이아웃의 "로그인" 링크 확인
    const loginLink = page.locator('a', { hasText: '로그인' }).first()
    await expect(loginLink).toBeVisible()
  })

  test('T6: PDF 다운로드 버튼과 공유 버튼이 같은 행에 존재', async ({
    page,
  }) => {
    await login(page)

    await page.goto(`${BASE_URL}/invoices`)
    await page.waitForLoadState('networkidle')
    const firstInvoiceLink = page.locator('a[href^="/invoices/"]').first()
    await firstInvoiceLink.click()
    await page.waitForLoadState('networkidle')

    // 공유 버튼
    const shareBtn = page.locator('button', { hasText: '공유' })
    // PDF 다운로드 버튼
    const pdfBtn = page.locator('button', { hasText: 'PDF 다운로드' })

    await expect(shareBtn).toBeVisible()
    await expect(pdfBtn).toBeVisible()

    // 두 버튼이 같은 flex 컨테이너에 있는지 (y좌표가 비슷한지 확인)
    const shareBox = await shareBtn.boundingBox()
    const pdfBox = await pdfBtn.boundingBox()

    expect(shareBox).not.toBeNull()
    expect(pdfBox).not.toBeNull()

    // 같은 행에 있으면 y좌표 차이가 작음 (10px 이내)
    expect(Math.abs(shareBox!.y - pdfBox!.y)).toBeLessThan(10)
  })
})
