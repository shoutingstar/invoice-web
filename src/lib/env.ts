import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VERCEL_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  // NextAuth.js v5 설정
  NEXTAUTH_SECRET: z
    .string()
    .optional()
    .default('dev-secret-key-do-not-use-in-production'),
  NEXTAUTH_URL: z.string().url().optional(),
  AUTH_TEST_EMAIL: z.string().email().default('test@example.com'),
  AUTH_TEST_PASSWORD: z.string().min(8).default('password123'),
  // Notion API 설정
  NOTION_API_KEY: z.string().optional(),
  NOTION_DATABASE_ID: z.string().optional(),
  NOTION_ITEMS_DATABASE_ID: z.string().optional(),
})

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  AUTH_TEST_EMAIL: process.env.AUTH_TEST_EMAIL,
  AUTH_TEST_PASSWORD: process.env.AUTH_TEST_PASSWORD,
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
  NOTION_ITEMS_DATABASE_ID: process.env.NOTION_ITEMS_DATABASE_ID,
})

export type Env = z.infer<typeof envSchema>
