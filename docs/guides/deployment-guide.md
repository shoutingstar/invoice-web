# Invoice Web 배포 가이드

## 개요

Invoice Web은 Next.js 15.5.3을 기반으로 Vercel에 배포됩니다. 이 가이드는 프로덕션 환경으로 배포하는 전 과정을 설명합니다.

---

## 1단계: 사전 확인

배포 전에 아래 사항을 반드시 확인하세요.

### 1-1. 로컬 환경 검사

```bash
# 모든 검사 통과 확인
npm run check-all

# 프로덕션 빌드 성공 확인
npm run build

# E2E 테스트 통과 확인
npx playwright test
```

### 1-2. 의존성 확인

```bash
# 보안 취약점 검사
npm audit

# 최신 패키지 업데이트 확인
npm outdated
```

### 1-3. 환경변수 확인

- `.env.local` 파일에 모든 필수 환경변수가 설정되어 있는지 확인
- 필수 변수:
  - `NOTION_API_KEY`: Notion 통합 API 키
  - `NOTION_DATABASE_ID`: Notion 견적서 DB ID
  - `AUTH_SECRET`: NextAuth.js JWT 비밀키
  - `AUTH_TEST_EMAIL`: 테스트 로그인 이메일 (프로덕션은 생략 가능)
  - `AUTH_TEST_PASSWORD`: 테스트 로그인 비밀번호 (프로덕션은 생략 가능)

---

## 2단계: Notion 준비

### 2-1. Notion Integration 생성

1. [Notion My Integrations](https://notion.so/my-integrations)에 접속
2. "새 통합 만들기(New integration)" 클릭
3. 이름: "Invoice Web"
4. 워크스페이스 선택
5. "제출(Submit)" → API 키 복사

### 2-2. Database 권한 설정

1. Notion 견적서 DB 열기
2. "공유(Share)" → "통합 추가(Add Integration)"
3. "Invoice Web" 통합 선택
4. 권한: "Editor" 선택

### 2-3. Database ID 추출

- DB URL: `https://notion.so/[USERNAME]/[DATABASE_ID]?v=[VIEW_ID]`
- `[DATABASE_ID]` 부분 복사 (하이픈 포함)
- 예: `3290c100-3d2e-80e2-a7b3-d8ad3c344811`

---

## 3단계: Vercel 배포 설정

### 3-1. GitHub 저장소 준비

프로젝트가 GitHub에 푸시되어 있어야 합니다.

```bash
# 변경사항 커밋
git add .
git commit -m "chore: 배포 설정 (vercel.json, .vercelignore)"
git push origin main
```

### 3-2. Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard)에 접속
2. "New Project" 클릭
3. GitHub 저장소 선택 (예: `your-username/invoice-web`)
4. "Import" 클릭

### 3-3. 환경변수 설정

Vercel 대시보드에서:

1. **Settings** → **Environment Variables**
2. 각 변수 추가:

| Key                  | Value                          | Scope                            |
| -------------------- | ------------------------------ | -------------------------------- |
| `NOTION_API_KEY`     | Notion 통합 API 키             | Production, Preview, Development |
| `NOTION_DATABASE_ID` | Notion DB ID                   | Production, Preview, Development |
| `AUTH_SECRET`        | `openssl rand -base64 32` 결과 | Production, Preview, Development |
| `AUTH_TEST_EMAIL`    | test@example.com               | Preview, Development (선택)      |
| `AUTH_TEST_PASSWORD` | test-password                  | Preview, Development (선택)      |

**AUTH_SECRET 생성 방법 (Mac/Linux):**

```bash
openssl rand -base64 32
```

**AUTH_SECRET 생성 방법 (Windows PowerShell):**

```powershell
[Convert]::ToBase64String([System.Random]::new().GetBytes(24))
```

### 3-4. 빌드 설정 확인

Vercel은 자동으로 감지하지만, 수동으로 확인하려면:

1. **Settings** → **Build & Deployment**
2. **Build Command**: `npm run build` (기본값 사용)
3. **Output Directory**: `.next` (기본값 사용)
4. **Install Command**: `npm install` (기본값 사용)

### 3-5. 배포

1. 설정 완료 후 "Deploy" 클릭
2. 빌드 로그 모니터링
3. 배포 완료 시 프로덕션 URL 할당

---

## 4단계: 배포 후 검증

### 4-1. 기본 접근성 테스트

```
https://your-vercel-url.vercel.app
```

1. 로그인 페이지 접근 확인
2. 테스트 계정으로 로그인 테스트
3. 대시보드, 목록, 상세 페이지 접근 확인
4. PDF 다운로드 기능 테스트

### 4-2. Notion API 연동 확인

1. 대시보드 통계 데이터 로드 확인
2. 견적서 목록 데이터 표시 확인
3. 견적서 상세 정보 로드 확인

### 4-3. 성능 확인

```bash
# Vercel 대시보드 → Analytics
# - LCP (Largest Contentful Paint): 2.5초 이하
# - FID (First Input Delay): 100ms 이하
# - CLS (Cumulative Layout Shift): 0.1 이하
```

### 4-4. 보안 헤더 확인

```bash
curl -i https://your-vercel-url.vercel.app | grep -E "X-Frame|X-Content-Type|Referrer"
```

예상 결과:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: origin-when-cross-origin
X-XSS-Protection: 1; mode=block
```

---

## 5단계: 모니터링 설정 (선택)

### 5-1. Vercel Analytics

1. Vercel 대시보드 → **Analytics** 탭
2. Web Vitals 모니터링
3. 성능 이상 감지 시 알림 설정

### 5-2. 에러 추적

현재 기본 에러 페이지 사용.

향후 구현:

- Sentry (에러 모니터링)
- DataDog (실시간 모니터링)

---

## 6단계: 지속적 배포 (CI/CD)

### 6-1. GitHub Actions 자동화

Vercel은 GitHub의 `main` 브랜치에 푸시하면 자동으로 배포합니다.

```bash
# 브랜치에서 작업
git checkout -b feature/new-feature
git commit -m "feat: 새 기능 추가"
git push origin feature/new-feature

# GitHub에서 PR 생성 → 검토 → 병합
# → Vercel 자동 배포
```

### 6-2. Preview Deployment

- PR 생성 시 Vercel 자동 생성
- 각 PR의 고유 URL에서 테스트 가능
- 병합 전 전체 기능 검증

---

## 트러블슈팅

### "빌드 실패" 오류

**증상**: Vercel 빌드 로그에 TypeScript/빌드 에러 표시

**해결**:

```bash
# 로컬에서 재현
npm run build

# 에러 수정 후
git push
```

### "Notion API 연결 실패"

**증상**: 배포 후 데이터 로드 실패

**확인**:

1. `NOTION_API_KEY` 설정 확인
2. `NOTION_DATABASE_ID` 형식 확인 (하이픈 포함)
3. Notion Integration 권한 확인

**테스트**:

```bash
# 배포 로그 확인
vercel logs --prod
```

### "로그인 불가"

**증상**: 로그인 페이지에서 계정 생성 또는 로그인 실패

**확인**:

1. `AUTH_SECRET` 설정 확인
2. `AUTH_TEST_EMAIL`, `AUTH_TEST_PASSWORD` 설정 확인
3. 프로덕션 환경에서는 테스트 계정 제거 후 별도 사용자 관리 필요

---

## 다음 단계

### 용량 모니터링

- Vercel 저장소 사용량 모니터링
- Next.js 빌드 크기 최적화

### 백업 전략

- 정기적 데이터 백업 (Notion ↔ DB 동기화)
- 배포 롤백 계획

### 보안 강화

- HTTPS 자동 설정 (Vercel 기본 제공)
- CORS 정책 설정
- Rate limiting 적용

### 성능 최적화

- Image Optimization
- 캐시 전략 개선
- CDN 설정

---

## 지원

문제 발생 시:

- Vercel 대시보드: [https://vercel.com/dashboard](https://vercel.com/dashboard)
- 배포 로그: **Settings → Deployments**
- 환경변수 확인: **Settings → Environment Variables**
