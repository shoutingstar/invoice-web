// 데이터베이스 정보 직접 조회 (GET 요청)
const apiKey = 'ntn_X323801835041FnNhiaHNWmRpCyszNfqvrbGzXk465ggjl'

// 두 가지 ID 형식 시도
const ids = {
  'without-hyphens': '3290c1003d2e80719b84000bf5751195',
  'with-hyphens': '3290c100-3d2e-8071-9b84-000bf5751195',
}

async function testDatabaseInfo() {
  console.log('🔍 데이터베이스 정보 조회 (여러 형식 시도)')
  console.log('')

  for (const [format, databaseId] of Object.entries(ids)) {
    console.log(`📝 형식: ${format}`)
    console.log(`ID: ${databaseId}`)

    const url = `https://api.notion.com/v1/databases/${databaseId}`
    console.log(`URL: ${url}`)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Notion-Version': '2026-03-11',
        },
      })

      console.log(`상태: ${response.status}`)

      const data = await response.json()

      if (response.ok) {
        console.log(`✅ 성공!`)
        console.log(
          `데이터베이스명: ${data.title?.[0]?.plain_text || '(제목 없음)'}`
        )
        console.log(`ID (API 응답): ${data.id}`)
      } else {
        console.log(`❌ 실패 - ${data.message}`)
      }
    } catch (error) {
      console.error(`❌ 에러: ${error.message}`)
    }

    console.log('')
  }
}

testDatabaseInfo()
