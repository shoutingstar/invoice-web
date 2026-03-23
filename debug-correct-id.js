// 수정된 데이터베이스 ID로 테스트
const apiKey = 'ntn_X323801835041FnNhiaHNWmRpCyszNfqvrbGzXk465ggjl'
const databaseId = '3290c1003d2e80719b84000bf5751195' // 수정된 Invoices ID

async function testNotionAPI() {
  console.log('🔍 수정된 데이터베이스 ID로 Notion API 테스트')
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
    const data = await response.json()

    if (response.ok) {
      console.log('✅ API 호출 성공!')
      console.log(`조회된 항목 수: ${data.results?.length || 0}`)
      console.log('')

      if (data.results && data.results.length > 0) {
        console.log('📋 첫 번째 항목:')
        const first = data.results[0]
        console.log(JSON.stringify(first, null, 2).substring(0, 500))
      }
    } else {
      console.log('❌ API 호출 실패!')
      console.log(`에러: ${data.message}`)
    }
  } catch (error) {
    console.error('❌ 네트워크 에러:', error.message)
  }
}

testNotionAPI()
