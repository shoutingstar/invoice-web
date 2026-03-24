/**
 * POST /api/invoices/[id]/share
 *
 * 관리자 인증이 필요한 공유 링크 생성 API
 * HMAC-SHA256 Stateless 토큰 발급
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createShareToken } from '@/lib/share-token'
import { env } from '@/lib/env'

/** 기본 공유 링크 유효 기간 (일) */
const DEFAULT_EXPIRES_DAYS = 7

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 인증 확인: 로그인한 사용자(관리자)만 공유 링크 생성 가능
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const { id } = await params

  if (!id) {
    return NextResponse.json(
      { error: '견적서 ID가 필요합니다.' },
      { status: 400 }
    )
  }

  // HMAC 서명에 사용할 비밀키 (NEXTAUTH_SECRET 재활용)
  const secret = env.NEXTAUTH_SECRET
  if (!secret) {
    console.error('NEXTAUTH_SECRET 환경변수가 설정되지 않았습니다.')
    return NextResponse.json(
      { error: '서버 설정 오류가 발생했습니다.' },
      { status: 500 }
    )
  }

  try {
    // HMAC-SHA256 토큰 생성
    const token = await createShareToken(id, secret, DEFAULT_EXPIRES_DAYS)

    // 만료 시각 계산
    const expiresAt = new Date(
      Date.now() + DEFAULT_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    ).toISOString()

    // 앱 기본 URL 결정 (배포 환경 대응)
    const appUrl =
      env.NEXT_PUBLIC_APP_URL ||
      (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : 'http://localhost:3000')

    const shareUrl = `${appUrl}/share/${token}`

    return NextResponse.json(
      {
        token,
        expiresAt,
        shareUrl,
        expiresInDays: DEFAULT_EXPIRES_DAYS,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('공유 토큰 생성 오류:', error)
    return NextResponse.json(
      { error: '공유 링크 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
