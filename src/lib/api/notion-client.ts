import { Client } from '@notionhq/client'
import { env } from '@/lib/env'

// Notion 클라이언트 싱글톤
let notionClient: Client | null = null

export function getNotionClient(): Client {
  if (!notionClient) {
    if (!env.NOTION_API_KEY) {
      throw new Error(
        'NOTION_API_KEY 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.'
      )
    }

    notionClient = new Client({
      auth: env.NOTION_API_KEY,
    })
  }

  return notionClient
}
