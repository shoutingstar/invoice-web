# 📋 Invoice Web 배포 체크리스트

**프로젝트**: Invoice Web
**버전**: 1.0.0 (MVP)
**배포 대상**: Vercel
**최종 검토 날짜**: 2026-03-24

---

## Phase 1: 사전 검사 ✅

### 1-1. 로컬 빌드 및 테스트

- [ ] **`npm run check-all` 통과**
  - [ ] TypeScript 타입체크 성공
  - [ ] ESLint 린트 검사 성공
  - [ ] Prettier 포맷 검사 성공

- [ ] **`npm run build` 성공**
  - [ ] 빌드 완료 (에러 없음)
  - [ ] 모든 페이지 정상 생성
  - [ ] Static/Dynamic 페이지 구분 확인
  - [ ] Middleware 155 kB 이하

- [ ] **`npx playwright test` 통과**
  - [ ] Phase 3 통합 테스트 (7/7 통과)
  - [ ] Phase 4 검색/필터 테스트 (7/7 통과)
  - [ ] 모든 E2E 시나리오 성공

### 1-2. 의존성 및 보안

- [ ] **`npm audit` 검사**
  - [ ] 심각한 취약점 없음
  - [ ] 필요한 패키지 업데이트 적용

- [ ] **필수 환경변수 확인**
  - [ ] `NOTION_API_KEY` 설정
  - [ ] `NOTION_DATABASE_ID` 설정
  - [ ] `AUTH_SECRET` 설정
  - [ ] `AUTH_TEST_EMAIL` 설정
  - [ ] `AUTH_TEST_PASSWORD` 설정

- [ ] **파일 시스템 확인**
  - [ ] `.env` 파일 존재 (로컬용)
  - [ ] `.env.example` 파일 존재 (템플릿용)
  - [ ] `.env` + `.env.local` 합쳐서 모든 변수 충족
  - [ ] `.gitignore`에 `.env` + `.env.local` 포함

---

## Phase 2: 배포 전 준비 ✅

### 2-1. Notion 세팅

- [ ] **Notion Integration 생성**
  - [ ] 이름: "Invoice Web"
  - [ ] API 키 생성 및 복사 (→ `NOTION_API_KEY`)

- [ ] **Database 권한 설정**
  - [ ] Integration 추가 (DB 공유)
  - [ ] Editor 권한 확인

- [ ] **Database ID 추출**
  - [ ] DB URL 형식 확인: `https://notion.so/[USERNAME]/[ID]?v=...`
  - [ ] ID 형식 확인 (하이픈 포함, 36자 예: `3290c100-3d2e-80e2-a7b3-d8ad3c344811`)
  - [ ] `NOTION_DATABASE_ID` 저장

### 2-2. GitHub 준비

- [ ] **GitHub 저장소 준비**
  - [ ] 모든 변경사항 커밋
  - [ ] `main` 브랜치로 푸시
  - [ ] 커밋 메시지: "chore: 배포 설정 (vercel.json, .vercelignore)"

- [ ] **GitHub 설정 확인**
  - [ ] 저장소 공개/비공개 설정 확인
  - [ ] Branch Protection 설정 (선택)
  - [ ] Actions 권한 설정

### 2-3. 배포 파일 생성

- [ ] **`vercel.json` 생성**
  - [ ] 환경변수 선언 포함
  - [ ] buildCommand: `npm run build`
  - [ ] installCommand: `npm install`
  - [ ] outputDirectory: `.next`

- [ ] **`.vercelignore` 생성**
  - [ ] 배포 제외 파일 목록 포함
  - [ ] 테스트, 로그, 개발 파일 제외

- [ ] **배포 가이드 문서 작성**
  - [ ] `docs/guides/deployment-guide.md` 작성
  - [ ] 체크리스트 포함

---

## Phase 3: Vercel 배포 설정 ✅

### 3-1. Vercel 프로젝트 생성

- [ ] **Vercel 계정 준비**
  - [ ] Vercel 가입 (무료 또는 Pro)
  - [ ] GitHub 계정 연동

- [ ] **프로젝트 Import**
  - [ ] "New Project" 클릭
  - [ ] GitHub 저장소 선택
  - [ ] "Import" 클릭

### 3-2. 환경변수 설정

Vercel Dashboard → **Settings** → **Environment Variables**

- [ ] **`NOTION_API_KEY`**
  - [ ] 값: Notion Integration API 키
  - [ ] Scope: Production, Preview, Development

- [ ] **`NOTION_DATABASE_ID`**
  - [ ] 값: Notion DB ID (하이픈 포함)
  - [ ] Scope: Production, Preview, Development

- [ ] **`AUTH_SECRET`**
  - [ ] 값: `openssl rand -base64 32` 결과
  - [ ] 길이: 최소 32자 이상
  - [ ] Scope: Production, Preview, Development

- [ ] **`AUTH_TEST_EMAIL`** (선택)
  - [ ] 값: test@example.com
  - [ ] Scope: Preview, Development

- [ ] **`AUTH_TEST_PASSWORD`** (선택)
  - [ ] 값: test-password
  - [ ] Scope: Preview, Development

### 3-3. 빌드 설정 확인

Vercel Dashboard → **Settings** → **Build & Deployment**

- [ ] **빌드 설정**
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`
  - [ ] Install Command: `npm install`
  - [ ] Node.js Version: 20 이상

- [ ] **배포 설정**
  - [ ] Auto Deploy: Enabled
  - [ ] Branch: main
  - [ ] Production Branch: main

---

## Phase 4: 배포 실행 ✅

### 4-1. 배포

- [ ] **Vercel 자동 배포**
  - [ ] GitHub에 푸시 → Vercel 자동 감지
  - [ ] 빌드 프로세스 시작
  - [ ] 빌드 완료 및 배포 성공

- [ ] **배포 로그 확인**
  - [ ] 빌드 성공 메시지
  - [ ] 에러 또는 경고 없음
  - [ ] 예상 빌드 시간: 2-5분

- [ ] **배포 URL 할당**
  - [ ] Production URL: `https://invoice-web.vercel.app` (또는 커스텀 도메인)
  - [ ] Preview URL: 자동 생성

### 4-2. 초기 확인

- [ ] **배포 상태 확인**
  - [ ] Vercel 대시보드에서 "Deployment" 탭 확인
  - [ ] 상태: "Ready" (파란색)
  - [ ] 배포 시간 확인

---

## Phase 5: 배포 후 검증 ✅

### 5-1. 기본 기능 테스트

배포 URL에 접속하여 테스트:

- [ ] **로그인 페이지**
  - [ ] `/login` 페이지 접근 가능
  - [ ] UI 정상 표시
  - [ ] 반응형 디자인 정상 (모바일/데스크탑)

- [ ] **로그인 기능**
  - [ ] 테스트 계정 로그인 성공
  - [ ] 세션 생성 확인 (쿠키 확인)
  - [ ] 대시보드로 리다이렉트

- [ ] **대시보드**
  - [ ] 통계 카드 로드 (전체, 대기, 승인완료, 발송완료)
  - [ ] 최근 견적서 데이터 표시
  - [ ] "전체 보기" 링크 작동

- [ ] **견적서 목록 (`/invoices`)**
  - [ ] 카드 그리드 표시
  - [ ] 페이지네이션 작동
  - [ ] 검색 기능 작동
  - [ ] 상태 필터 작동
  - [ ] 카드 클릭 시 상세 페이지 이동

- [ ] **견적서 상세 (`/invoices/[id]`)**
  - [ ] 전체 정보 로드 (고객, 담당자, 항목 테이블)
  - [ ] 항목 테이블 정상 표시
  - [ ] 합계 금액 정확
  - [ ] "PDF 다운로드" 버튼 표시

- [ ] **PDF 다운로드**
  - [ ] PDF 다운로드 버튼 클릭
  - [ ] PDF 파일 다운로드 성공
  - [ ] PDF 파일명: `invoice_[견적번호].pdf`
  - [ ] PDF 한글 텍스트 정상 표시

- [ ] **로그아웃**
  - [ ] 로그아웃 버튼 클릭
  - [ ] 로그인 페이지로 리다이렉트
  - [ ] 세션 삭제 확인

### 5-2. Notion API 연동 확인

- [ ] **데이터 로드 성공**
  - [ ] 대시보드 통계: Notion 실제 데이터 표시
  - [ ] 목록 페이지: 모든 견적서 표시
  - [ ] 상세 페이지: 개별 견적서 전체 정보 표시

- [ ] **필드 데이터 정상**
  - [ ] 고객 정보 (이메일, 연락처)
  - [ ] 담당자 정보 (이메일, 연락처)
  - [ ] 견적 항목 (품명, 수량, 단가, 금액)

### 5-3. 성능 확인

- [ ] **로딩 속도**
  - [ ] 페이지 로드: 2초 이내
  - [ ] 데이터 로드: 3초 이내
  - [ ] PDF 생성: 5초 이내

- [ ] **Vercel Analytics** (선택)
  - [ ] LCP (Largest Contentful Paint): 2.5초 이하
  - [ ] FID (First Input Delay): 100ms 이하
  - [ ] CLS (Cumulative Layout Shift): 0.1 이하

### 5-4. 보안 확인

- [ ] **HTTPS 자동 적용**
  - [ ] URL이 HTTPS로 시작
  - [ ] 브라우저 보안 아이콘 표시

- [ ] **보안 헤더 확인**

  ```bash
  curl -i https://your-vercel-url.vercel.app | grep -E "X-Frame|X-Content-Type|Referrer"
  ```

  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `Referrer-Policy: origin-when-cross-origin`
  - [ ] `X-XSS-Protection: 1; mode=block`

- [ ] **인증 보안**
  - [ ] `AUTH_SECRET` 비밀번호화 (평문 미노출)
  - [ ] JWT 토큰 설정 확인
  - [ ] 로그인 페이지 HTTPS 전송

### 5-5. 에러 페이지

- [ ] **404 에러**
  - [ ] 존재하지 않는 견적서 ID 접근
  - [ ] 에러 페이지 정상 표시
  - [ ] "목록으로" 버튼 작동

- [ ] **500 에러**
  - [ ] Notion API 장애 시뮬레이션
  - [ ] 에러 바운더리 작동
  - [ ] 에러 메시지 표시

---

## Phase 6: 사후 관리 ✅

### 6-1. 지속적 배포 설정

- [ ] **GitHub Actions (자동)**
  - [ ] `main` 브랜치 푸시 → Vercel 자동 배포
  - [ ] PR 생성 → Preview URL 자동 생성
  - [ ] 병합 → 프로덕션 배포

### 6-2. 모니터링

- [ ] **Vercel 대시보드 정기 확인**
  - [ ] Deployments 탭: 배포 히스토리 확인
  - [ ] Analytics 탭: 성능 지표 모니터링
  - [ ] Settings 탭: 환경변수 유지

- [ ] **에러 모니터링**
  - [ ] 배포 로그 확인
  - [ ] 런타임 에러 감시
  - [ ] API 연동 상태 확인

### 6-3. 유지보수

- [ ] **정기 패키지 업데이트**
  - [ ] 월 1회 `npm outdated` 검사
  - [ ] 보안 업데이트 즉시 적용

- [ ] **정기 E2E 테스트**
  - [ ] 월 1회 Playwright 전체 테스트
  - [ ] 새 기능 배포 전 테스트 필수

- [ ] **문서 유지**
  - [ ] 배포 가이드 최신화
  - [ ] 체크리스트 업데이트

---

## Phase 7: 최종 승인

### 배포 최종 확인

- [ ] **모든 체크리스트 항목 완료**
- [ ] **프로덕션 환경 안정성 확인**
- [ ] **사용자 피드백 수집**

### 배포 완료

- [ ] **배포 완료 공지**
  - [ ] 팀에 배포 완료 통지
  - [ ] 프로덕션 URL 공유
  - [ ] 사용 가이드 제공

---

## 참고 링크

- 배포 가이드: `docs/guides/deployment-guide.md`
- Vercel 대시보드: https://vercel.com/dashboard
- Notion API: https://developers.notion.com/
- Next.js 배포: https://nextjs.org/docs/deployment

---

## 체크리스트 상태

| 단계    | 상태 | 완료 일시  | 담당자 |
| ------- | ---- | ---------- | ------ |
| Phase 1 | ✅   | 2026-03-24 | 개발팀 |
| Phase 2 | ✅   | 2026-03-24 | 개발팀 |
| Phase 3 | 📋   | -          | -      |
| Phase 4 | 📋   | -          | -      |
| Phase 5 | 📋   | -          | -      |
| Phase 6 | 📋   | -          | -      |
| Phase 7 | 📋   | -          | -      |

---

**최종 업데이트**: 2026-03-24
**다음 검토**: 배포 후 1주일
