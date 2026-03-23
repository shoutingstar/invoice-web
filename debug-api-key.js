// API 키 유효성 확인
const apiKey = 'ntn_X323801835041FnNhiaHNWmRpCyszNfqvrbGzXk465ggjl'

async function testApiKey() {
  console.log('🔍 API 키 유효성 확인')
  console.log(`API Key: ${apiKey.substring(0, 15)}...`)
  console.log('')

  try {
    const response = await fetch('https://api.notion.com/v1/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2026-03-11',
      },
    })

    console.log(`📊 응답 상태: ${response.status}`)
    const data = await response.json()

    if (response.ok) {
      console.log('✅ API 키 유효!')
      console.log(`사용자: ${data.name}`)
      console.log(`ID: ${data.id}`)
    } else {
      console.log('❌ API 키 유효하지 않음!')
      console.log(`에러: ${data.message}`)
      console.log(`에러 코드: ${data.code}`)
    }
  } catch (error) {
    console.error('❌ 네트워크 에러:', error.message)
  }
}

testApiKey()
