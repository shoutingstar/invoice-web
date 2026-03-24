/**
 * Phase 5 Task 018 E2E 테스트
 * 공유 링크 (Stateless HMAC 토큰) 기능 검증
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'password123'

test.describe('Phase 5 Task 018 - 공유 링크', () => {
  // 각 테스트 전 로그인 및 견적서 상세 페이지 이동
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', TEST_EMAIL)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)

    // 견적서 목록에서 첫 번째 카드 클릭
    await page.goto(`${BASE_URL}/invoices`)
    await page.waitForLoadState('networkidle')
    const firstCard = page.locator('a[href^="/invoices/"]').first()
    await firstCard.click()
    await page.waitForLoadState('networkidle')
  })

  test('T1: 상세 페이지에 공유 버튼 존재', async ({ page }) => {
    // "공유" 텍스트가 있는 버튼 확인
    const shareBtn = page.locator('button', { hasText: '공유' })
    await expect(shareBtn).toBeVisible()
  })

  test('T2: 공유 버튼 클릭 시 API 200 응답', async ({ page }) => {
    // API 응답 가로채기
    const responsePromise = page.waitForResponse(
      response =>
        response.url().includes('/api/invoices/') &&
        response.url().includes('/share') &&
        response.request().method() === 'POST'
    )

    const shareBtn = page.locator('button', { hasText: '공유' })
    await shareBtn.click()

    const response = await responsePromise
    expect(response.status()).toBe(200)
  })

  test('T3: 공유 API 응답에 /share/ 경로의 URL 포함', async ({ page }) => {
    let shareUrl = ''

    // API 응답 가로채기
    page.on('response', async response => {
      if (
        response.url().includes('/api/invoices/') &&
        response.url().includes('/share') &&
        response.request().method() === 'POST'
      ) {
        const body = (await response.json()) as { shareUrl?: string }
        if (body.shareUrl) {
          shareUrl = body.shareUrl
        }
      }
    })

    const shareBtn = page.locator('button', { hasText: '공유' })
    await shareBtn.click()

    // 토스트 알림 대기 (공유 성공 후 표시됨)
    await page.waitForTimeout(1500)

    expect(shareUrl).toContain('/share/')
  })

  test('T4: 로그아웃 후 공유 URL에 비인증 접근 가능', async ({ page }) => {
    let shareUrl = ''

    // 공유 링크 생성
    page.on('response', async response => {
      if (
        response.url().includes('/api/invoices/') &&
        response.url().includes('/share') &&
        response.request().method() === 'POST'
      ) {
        const body = (await response.json()) as { shareUrl?: string }
        if (body.shareUrl) {
          shareUrl = body.shareUrl
        }
      }
    })

    const shareBtn = page.locator('button', { hasText: '공유' })
    await shareBtn.click()
    await page.waitForTimeout(1500)

    // shareUrl이 생성되었는지 확인
    expect(shareUrl).toBeTruthy()
    expect(shareUrl).toContain('/share/')

    // 로그아웃: 로그아웃 버튼 클릭
    const logoutBtn = page
      .locator('header')
      .locator('button', { hasText: '로그아웃' })
    await logoutBtn.click()
    await page.waitForURL(`${BASE_URL}/login`)

    // 로그아웃 상태에서 공유 URL 접근
    await page.goto(shareUrl)
    await page.waitForLoadState('networkidle')

    // 공유 페이지가 로딩되는지 확인 (로그인 페이지로 리다이렉트되면 안 됨)
    expect(page.url()).not.toContain('/login')
    expect(page.url()).toContain('/share/')

    // 견적서 번호 또는 공유 안내 텍스트 확인
    const content = page.locator('main')
    await expect(content).toBeVisible()
  })

  test('T5: 위조 토큰으로 접근 시 404 페이지 표시', async ({ page }) => {
    // 임의로 생성한 잘못된 토큰으로 접근
    const fakeToken = 'aW52YWxpZA.c2lnbmF0dXJl'
    await page.goto(`${BASE_URL}/share/${fakeToken}`)
    await page.waitForLoadState('networkidle')

    // "링크가 유효하지 않습니다" 메시지 확인
    const notFoundMsg = page.locator('h1', {
      hasText: '링크가 유효하지 않습니다',
    })
    await expect(notFoundMsg).toBeVisible()
  })

  test('T6: 공유 페이지에 "공유된 견적서" 안내 표시', async ({ page }) => {
    let shareUrl = ''

    page.on('response', async response => {
      if (
        response.url().includes('/api/invoices/') &&
        response.url().includes('/share') &&
        response.request().method() === 'POST'
      ) {
        const body = (await response.json()) as { shareUrl?: string }
        if (body.shareUrl) {
          shareUrl = body.shareUrl
        }
      }
    })

    const shareBtn = page.locator('button', { hasText: '공유' })
    await shareBtn.click()
    await page.waitForTimeout(1500)

    if (shareUrl) {
      await page.goto(shareUrl)
      await page.waitForLoadState('networkidle')

      // 공유 레이아웃의 "공유된 견적서" 배지 확인 (배지는 span 요소)
      const shareIndicator = page.locator('span:has-text("공유된 견적서")')
      await expect(shareIndicator).toBeVisible()
    }
  })
})
