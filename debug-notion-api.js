// Notion API 디버깅 스크립트
const apiKey = 'ntn_X323801835041FnNhiaHNWmRpCyszNfqvrbGzXk465ggjl'
const databaseId = '3290c1003d2e80e2a7b3d8ad3c344811'

async function testNotionAPI() {
  console.log('🔍 Notion API 테스트 시작')
  console.log(`API Key: ${apiKey.substring(0, 10)}...`)
  console.log(`Database ID: ${databaseId}`)
  console.log('')

  const url = `https://api.notion.com/v1/databases/${databaseId}/query`
  console.log(`📡 요청 URL: ${url}`)
  console.log('')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2026-03-11',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 10,
      }),
    })

    console.log(`📊 응답 상태: ${response.status} ${response.statusText}`)
    console.log(`📋 응답 헤더:`)
    for (const [key, value] of response.headers) {
      console.log(`  ${key}: ${value}`)
    }
    console.log('')

    const data = await response.json()
    console.log('📄 응답 본문:')
    console.log(JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.log('')
      console.log('❌ API 호출 실패!')
      console.log(`에러: ${data.message}`)
      console.log(`에러 코드: ${data.code}`)
    } else {
      console.log('')
      console.log('✅ API 호출 성공!')
      console.log(`조회된 항목 수: ${data.results?.length || 0}`)
    }
  } catch (error) {
    console.error('❌ 네트워크 에러:', error.message)
  }
}

testNotionAPI()
