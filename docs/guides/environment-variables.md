# 환경변수 설정 가이드

Invoice Web에서 사용하는 모든 환경변수에 대한 설명 및 설정 방법입니다.

---

## 개요

환경변수는 3가지 환경에서 다르게 관리됩니다:

| 환경          | 파일           | 용도                     | 커밋                       |
| ------------- | -------------- | ------------------------ | -------------------------- |
| **로컬 개발** | `.env.local`   | 로컬 테스트용, 민감 정보 | ❌ `.gitignore`            |
| **프로덕션**  | `.env`         | CI/CD, 프로덕션 배포     | ✅ 커밋 가능 (공개 정보만) |
| **템플릿**    | `.env.example` | 샘플, 개발자 온보딩      | ✅ 커밋 필수               |

---

## 환경변수 목록

### 필수 변수 (프로덕션 배포 필수)

#### 1. `NOTION_API_KEY`

**설명**: Notion 통합 API 인증 키

**형식**: 문자열 (36자 이상)

**예시**: `secret_aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsT`

**생성 방법**:

1. [Notion My Integrations](https://notion.so/my-integrations) 접속
2. "새 통합 만들기(New integration)" 클릭
3. 이름: "Invoice Web"
4. 워크스페이스 선택
5. "Submit" 클릭
6. "Show" 버튼에서 API 키 복사

**검증**:

```bash
# API 키가 유효한지 테스트
curl -X GET https://api.notion.com/v1/me \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28"

# 결과: JSON 객체 반환 (유효함)
# 결과: 401 Unauthorized (무효함)
```

**보안 주의사항**:

- 절대 GitHub에 커밋하지 마세요 (`.gitignore`에 포함)
- 팀원과 공유할 때는 안전한 채널 사용 (Slack, 1Password 등)
- 정기적으로 로테이션 권장 (분기별)

---

#### 2. `NOTION_DATABASE_ID`

**설명**: Notion 견적서 데이터베이스 ID

**형식**: UUID (하이픈 포함, 36자)

**예시**: `3290c100-3d2e-80e2-a7b3-d8ad3c344811`

**추출 방법**:

1. Notion 견적서 DB 열기
2. 브라우저 주소창에서 URL 확인:
   ```
   https://notion.so/[USERNAME]/[DATABASE_ID]?v=[VIEW_ID]
   ```
3. `[DATABASE_ID]` 부분 복사 (예: `3290c100-3d2e-80e2-a7b3-d8ad3c344811`)

**포맷 확인**:

```bash
# 하이픈 포함 확인
echo "3290c100-3d2e-80e2-a7b3-d8ad3c344811" | grep -E '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'

# 결과: 일치함 (OK)
# 결과: 일치하지 않음 (형식 오류)
```

**권한 설정**:

1. Notion DB에서 "Share" 클릭
2. "Add Integration" 선택
3. "Invoice Web" 통합 선택
4. 권한: **Editor** 이상 필요

**검증**:

```bash
# API를 통해 DB 접근 가능한지 확인
curl -X POST https://api.notion.com/v1/databases/$NOTION_DATABASE_ID/query \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{}'

# 결과: 페이지 목록 반환 (유효함)
# 결과: 403 Forbidden (권한 없음)
# 결과: 404 Not Found (ID 오류)
```

**보안 주의사항**:

- DB ID는 공개해도 안전 (권한 없으면 접근 불가)
- API 키와 함께만 의미 있음
- 여러 데이터베이스 사용 시 ID만 변경하면 됨

---

#### 3. `AUTH_SECRET`

**설명**: NextAuth.js JWT 서명 비밀키

**형식**: Base64 인코딩된 무작위 문자열 (32자 이상)

**생성 방법**:

**Mac/Linux**:

```bash
openssl rand -base64 32
# 출력: 예: aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsT1u2v==
```

**Windows PowerShell**:

```powershell
[Convert]::ToBase64String([System.Random]::new().GetBytes(24))
# 출력: 예: aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsT1u2v==
```

**Node.js** (모든 플랫폼):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**검증**:

```bash
# 길이 확인 (32자 이상)
echo $AUTH_SECRET | wc -c

# 결과: 45 (32자 이상, OK)
```

**보안 주의사항**:

- 절대 공개하지 마세요 (로그인 토큰이 위조될 수 있음)
- GitHub에 커밋하지 마세요 (즉시 로테이션 필요)
- 프로덕션 배포 후 정기적 로테이션 권장 (연 2회)
- 각 환경(개발/스테이징/프로덕션)마다 다른 값 사용

---

### 선택 변수 (개발/테스트 환경)

#### 4. `AUTH_TEST_EMAIL`

**설명**: 개발 및 테스트용 계정 이메일

**형식**: 유효한 이메일 형식

**예시**: `test@example.com`

**사용처**:

- E2E 테스트 (Playwright)
- 로컬 개발 환경
- Preview/Staging 배포

**프로덕션 환경**:

- 설정하지 않음 (테스트 계정 미노출)
- 별도 사용자 관리 시스템 필요

**보안 주의사항**:

- 실제 이메일 주소 사용 가능
- 프로덕션에서는 제거
- 테스트 계정은 정기적으로 정리

---

#### 5. `AUTH_TEST_PASSWORD`

**설명**: 개발 및 테스트용 계정 비밀번호

**형식**: 문자열 (8자 이상 권장)

**예시**: `test-password-123`

**사용처**:

- E2E 테스트 (Playwright)
- 로컬 개발 환경
- Preview/Staging 배포

**프로덕션 환경**:

- 설정하지 않음
- 실제 사용자 인증 시스템 필요

**보안 주의사항**:

- 약한 비밀번호 사용 가능 (테스트용)
- GitHub에 커밋하지 마세요
- 프로덕션에서는 제거

---

## 환경변수 파일 설정

### 1. 로컬 개발 환경 (`.env.local`)

```bash
# .env.local (커밋 금지, 로컬 개발용)

# Notion API
NOTION_API_KEY=secret_aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsT
NOTION_DATABASE_ID=3290c100-3d2e-80e2-a7b3-d8ad3c344811

# NextAuth.js
AUTH_SECRET=aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsT1u2v==
AUTH_TEST_EMAIL=test@example.com
AUTH_TEST_PASSWORD=test-password-123
```

### 2. 프로덕션 환경 (`.env`)

```bash
# .env (커밋 가능, 공개 정보 + CI/CD용)

# Notion Database ID (공개 가능, 권한 없으면 접근 불가)
NOTION_DATABASE_ID=3290c100-3d2e-80e2-a7b3-d8ad3c344811

# 민감한 정보는 Vercel 대시보드에서 설정
# NOTION_API_KEY → Vercel Secrets
# AUTH_SECRET → Vercel Secrets
```

### 3. 템플릿 (`.env.example`)

```bash
# .env.example (커밋 필수, 샘플용)

# Notion API (https://notion.so/my-integrations에서 생성)
NOTION_API_KEY=secret_<your-api-key>
NOTION_DATABASE_ID=<your-database-id>

# NextAuth.js (openssl rand -base64 32로 생성)
AUTH_SECRET=<openssl-generated-secret>

# 테스트 계정 (선택, 개발용)
AUTH_TEST_EMAIL=test@example.com
AUTH_TEST_PASSWORD=test-password
```

---

## Vercel 배포 시 환경변수 설정

### Step 1: Vercel 대시보드 접속

1. [https://vercel.com/dashboard](https://vercel.com/dashboard) 접속
2. Invoice Web 프로젝트 선택
3. **Settings** → **Environment Variables**

### Step 2: 환경변수 추가

각 변수를 다음과 같이 추가합니다:

**변수 1: `NOTION_API_KEY`**

- Key: `NOTION_API_KEY`
- Value: Notion Integration API 키
- Scope:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**변수 2: `NOTION_DATABASE_ID`**

- Key: `NOTION_DATABASE_ID`
- Value: Notion DB ID (하이픈 포함)
- Scope:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**변수 3: `AUTH_SECRET`**

- Key: `AUTH_SECRET`
- Value: `openssl rand -base64 32` 결과
- Scope:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**변수 4: `AUTH_TEST_EMAIL`** (선택)

- Key: `AUTH_TEST_EMAIL`
- Value: test@example.com
- Scope:
  - ❌ Production (제거)
  - ✅ Preview
  - ✅ Development

**변수 5: `AUTH_TEST_PASSWORD`** (선택)

- Key: `AUTH_TEST_PASSWORD`
- Value: test-password-123
- Scope:
  - ❌ Production (제거)
  - ✅ Preview
  - ✅ Development

### Step 3: 배포 재트리거

변수 설정 후 배포를 재트리거해야 적용됩니다:

```bash
git commit --allow-empty -m "chore: trigger redeploy with new env vars"
git push origin main
```

---

## 환경변수 검증 및 디버깅

### 1. 로컬 검증

```bash
# 환경변수 로드 확인
npm run dev

# 브라우저 콘솔에서 다음 확인:
# 1. 로그인 페이지 정상 표시
# 2. 로그인 후 대시보드 데이터 로드
```

### 2. Vercel 배포 검증

```bash
# Vercel 배포 로그에서 환경변수 확인
vercel logs --prod

# 프로덕션 배포 후 다음 확인:
# 1. /dashboard 접근 가능
# 2. 통계 데이터 정상 로드
# 3. Notion 연동 데이터 표시
```

### 3. 에러 분석

**에러: "NOTION_API_KEY 환경변수가 설정되지 않았습니다"**

- ✅ 해결: Vercel 대시보드에서 `NOTION_API_KEY` 추가
- ✅ 배포 재트리거

**에러: "Notion API 에러: 404 - Object not found"**

- 원인: `NOTION_DATABASE_ID` 오류
- ✅ 해결: DB ID 포맷 확인 (하이픈 포함, 36자)

**에러: "Notion API 에러: 403 - Unauthorized"**

- 원인: `NOTION_API_KEY` 오류 또는 권한 없음
- ✅ 해결: API 키 확인 및 DB 권한 재설정

**에러: "로그인 불가"**

- 원인: `AUTH_SECRET` 오류
- ✅ 해결: 새로운 AUTH_SECRET 생성 및 재배포

---

## 환경변수 보안 체크리스트

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] `.env` 파일에 민감한 정보(API 키)가 포함되어 있지 않은가?
- [ ] `.env.example`이 커밋되어 있는가?
- [ ] Vercel 대시보드에 모든 필수 변수가 설정되어 있는가?
- [ ] `AUTH_SECRET`은 각 환경마다 다른 값인가?
- [ ] API 키가 정기적으로 로테이션되고 있는가?
- [ ] 팀원은 안전한 채널을 통해 환경변수를 공유받았는가?

---

## 환경변수 로테이션 (정기적 보안 관리)

### Notion API 키 로테이션 (분기별)

1. [Notion My Integrations](https://notion.so/my-integrations) 접속
2. Invoice Web 통합 선택
3. "Regenerate Secret" 클릭
4. 새 API 키 복사
5. Vercel 대시보드에서 `NOTION_API_KEY` 업데이트
6. 이전 키 삭제

### AUTH_SECRET 로테이션 (분기별)

1. 새로운 비밀키 생성:
   ```bash
   openssl rand -base64 32
   ```
2. Vercel 대시보드에서 `AUTH_SECRET` 업데이트
3. 모든 세션이 자동으로 재인증됨

---

## 참고 링크

- Notion API: https://developers.notion.com/
- Notion My Integrations: https://notion.so/my-integrations
- NextAuth.js: https://next-auth.js.org/
- Vercel Secrets: https://vercel.com/docs/environment-variables

---

**최종 업데이트**: 2026-03-24
