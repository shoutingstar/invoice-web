'use server'

import { signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'

export async function loginAction(prevState: unknown, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: '이메일 또는 비밀번호가 올바르지 않습니다' }
    }
    // redirect는 throw로 처리되므로 재throw 필수
    throw error
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' })
}
