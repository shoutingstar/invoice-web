/**
 * 로그인 폼 Zod 스키마
 */

import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
})

export type LoginFormData = z.infer<typeof loginSchema>
