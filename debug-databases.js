// Notion에서 접근 가능한 모든 데이터베이스 목록 조회
const apiKey = 'ntn_X323801835041FnNhiaHNWmRpCyszNfqvrbGzXk465ggjl'

async function listAccessibleDatabases() {
  console.log('🔍 접근 가능한 데이터베이스 목록 조회')
  console.log('')

  try {
    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2026-03-11',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          value: 'data_source',
          property: 'object',
        },
        sort: {
          direction: 'ascending',
          timestamp: 'last_edited_time',
        },
        page_size: 100,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log(`✅ 접근 가능한 데이터베이스: ${data.results.length}개`)
      console.log('')

      if (data.results.length === 0) {
        console.log('⚠️ 접근 가능한 데이터베이스가 없습니다!')
        console.log('Notion 통합 설정을 확인해주세요.')
      } else {
        data.results.forEach((db, index) => {
          console.log(`${index + 1}. ${db.title?.[0]?.plain_text || '(제목 없음)'}`)
          console.log(`   ID: ${db.id}`)
          console.log(`   URL: https://notion.so/${db.id.replace(/-/g, '')}`)
          console.log('')
        })
      }
    } else {
      console.log('❌ 조회 실패!')
      console.log(`에러: ${data.message}`)
    }
  } catch (error) {
    console.error('❌ 네트워크 에러:', error.message)
  }
}

listAccessibleDatabases()
