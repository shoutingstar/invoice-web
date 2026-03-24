/**
 * NextAuth.js 타입 확장
 * Session, User, JWT에 role 필드 추가
 */

import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'user'
    } & DefaultSession['user']
  }
  interface User {
    role?: 'admin' | 'user'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: 'admin' | 'user'
  }
}
