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

        // 테스트 계정 검증
        if (
          email === env.AUTH_TEST_EMAIL &&
          password === env.AUTH_TEST_PASSWORD
        ) {
          return {
            id: '1',
            email,
            name: '김담당',
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
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
