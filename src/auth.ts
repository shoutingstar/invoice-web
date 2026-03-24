import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { loginSchema } from '@/lib/schemas/login'
import { env } from '@/lib/env'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) {
          return null
        }

        const { email, password } = parsed.data

        // 테스트 계정 검증 - 역할 분리
        // 관리자 계정
        if (
          email === env.AUTH_TEST_EMAIL &&
          password === env.AUTH_TEST_PASSWORD
        ) {
          return {
            id: '1',
            email,
            name: '김담당',
            role: 'admin' as const,
          }
        }

        // 클라이언트 계정
        if (email === 'client@example.com' && password === 'password123') {
          return {
            id: '2',
            email,
            name: '고객사',
            role: 'user' as const,
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        // authorize()에서 반환한 role을 JWT에 저장
        token.role = user.role ?? 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        // JWT의 role을 세션에 전파
        session.user.role = token.role as 'admin' | 'user'
      }
      return session
    },
  },
})
