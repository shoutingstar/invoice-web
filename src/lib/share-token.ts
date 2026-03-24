/**
 * 공유 링크 토큰 생성 및 검증 유틸리티
 *
 * 설계: Stateless HMAC-SHA256 토큰
 * 형식: base64url(payload) + "." + base64url(signature)
 * payload: JSON { id: string, exp: number (Unix timestamp, 초) }
 *
 * 주의: NEXTAUTH_SECRET이 교체되면 기존 공유 링크가 모두 무효화됩니다.
 */

/** base64url 인코딩 (URL-safe, 패딩 없음) */
function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/** base64url 디코딩 */
function fromBase64Url(str: string): Uint8Array {
  // 패딩 복원 및 URL-safe 문자 원복
  const padded = str
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(str.length + ((4 - (str.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * HMAC-SHA256 서명을 위한 CryptoKey 임포트
 * Web Crypto API (Node.js 18+ globalThis.crypto 지원)
 */
async function importHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = encoder.encode(secret)
  return crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false, // 내보내기 불가
    ['sign', 'verify']
  )
}

/**
 * 공유 토큰 생성
 *
 * @param invoiceId - 견적서 Notion 페이지 ID
 * @param secret - HMAC 서명 비밀키 (NEXTAUTH_SECRET 권장)
 * @param expiresInDays - 유효 기간 (기본 7일)
 * @returns base64url(payload).base64url(signature) 형식의 토큰
 */
export async function createShareToken(
  invoiceId: string,
  secret: string,
  expiresInDays = 7
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + expiresInDays * 24 * 60 * 60

  const payload = JSON.stringify({ id: invoiceId, exp })
  const encoder = new TextEncoder()

  // payload를 base64url로 인코딩
  const payloadBytes = encoder.encode(payload)
  const payloadB64 = toBase64Url(payloadBytes.buffer as ArrayBuffer)

  // HMAC-SHA256 서명 생성
  const key = await importHmacKey(secret)
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payloadB64)
  )
  const signatureB64 = toBase64Url(signatureBuffer)

  return `${payloadB64}.${signatureB64}`
}

/**
 * 공유 토큰 검증
 *
 * @param token - 검증할 토큰 문자열
 * @param secret - HMAC 서명 비밀키
 * @returns invoiceId (유효한 경우) | null (만료되었거나 위조된 경우)
 */
export async function verifyShareToken(
  token: string,
  secret: string
): Promise<string | null> {
  try {
    const dotIndex = token.lastIndexOf('.')
    if (dotIndex === -1) return null

    const payloadB64 = token.slice(0, dotIndex)
    const signatureB64 = token.slice(dotIndex + 1)

    // 서명 검증
    const encoder = new TextEncoder()
    const key = await importHmacKey(secret)
    const signatureBytes = fromBase64Url(signatureB64)

    // Uint8Array를 ArrayBuffer로 변환 (Web Crypto API 타입 요구사항)
    const signatureBuffer = signatureBytes.buffer.slice(
      signatureBytes.byteOffset,
      signatureBytes.byteOffset + signatureBytes.byteLength
    ) as ArrayBuffer

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(payloadB64)
    )

    if (!isValid) return null

    // payload 디코딩 및 만료 확인
    const payloadBytes = fromBase64Url(payloadB64)
    const payloadJson = new TextDecoder().decode(payloadBytes)
    const payload = JSON.parse(payloadJson) as { id: string; exp: number }

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return null

    return payload.id
  } catch {
    // 잘못된 형식이거나 파싱 오류
    return null
  }
}
