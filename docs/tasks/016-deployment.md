# Task 016: 배포 및 운영 환경 구성

**상태**: 📋 진행 중
**최종 업데이트**: 2026-03-24

---

## 개요

Invoice Web MVP를 프로덕션 환경으로 배포하고 운영 환경을 구성합니다. 배포 전 모든 검사와 E2E 테스트를 완료한 후 Vercel을 통해 배포합니다.

---

## 요구사항

### 기능 요구사항

- ✅ 프로덕션 빌드 검증 (`npm run build` 성공)
- ✅ E2E 테스트 통과 (Playwright)
- ✅ Vercel 배포 설정 및 환경변수 구성
- ✅ 배포 후 전체 기능 테스트
- ✅ 에러 모니터링 기본 설정
- ✅ 배포 체크리스트 작성

### 기술 요구사항

- Next.js 15.5.3 프로덕션 빌드
- Vercel 배포 (GitHub 연동)
- 환경변수 안전 관리
- HTTPS 자동 설정
- 성능 모니터링

### 배포 전 필수 항목

- ✅ `vercel.json` 생성
- ✅ `.vercelignore` 생성
- ✅ `.env.example` 최신화
- ✅ 배포 가이드 문서 작성
- ✅ 환경변수 설정 가이드 작성
- ✅ 배포 체크리스트 작성

---

## 구현 계획

### Step 1: 로컬 환경 최종 검사 ✅

- [x] `npm run check-all` 통과 (TypeScript, ESLint, Prettier)
- [x] `npm run build` 성공
- [x] 모든 페이지 정상 생성

### Step 2: E2E 테스트 실행 ✅

- [x] Playwright 브라우저 설치
- [x] 개발 서버 시작
- [x] 전체 시나리오 테스트 실행
  - 로그인/로그아웃
  - 대시보드 데이터 로드
  - 목록 페이지 검색/필터
  - 상세 페이지 조회
  - PDF 다운로드
- [x] 모든 테스트 통과 확인

### Step 3: 배포 파일 생성 ✅

- [x] `vercel.json` 생성
  - 환경변수 선언
  - 빌드 명령어 설정
  - Node.js 버전 명시

- [x] `.vercelignore` 생성
  - 배포 제외 파일 목록
  - 테스트/개발 파일 제외

- [x] `.env.example` 최신화
  - 모든 필수 환경변수 문서화
  - 설정 가이드 추가

### Step 4: 문서 작성 ✅

- [x] `docs/guides/deployment-guide.md` 작성
  - Notion 준비 가이드
  - Vercel 배포 단계별 가이드
  - 배포 후 검증 체크리스트
  - 트러블슈팅

- [x] `docs/guides/environment-variables.md` 작성
  - 환경변수 설명 및 생성 방법
  - 로컬/프로덕션 설정 방법
  - Vercel 환경변수 설정
  - 검증 및 디버깅 가이드

- [x] `docs/DEPLOYMENT-CHECKLIST.md` 작성
  - Phase별 체크리스트
  - 배포 전/중/후 검증 항목
  - 최종 승인 절차

### Step 5: GitHub 준비 📋

- [ ] 모든 변경사항 커밋
- [ ] `main` 브랜치로 푸시
- [ ] 커밋 메시지: "chore: 배포 설정 (vercel.json, .vercelignore, 문서)"

### Step 6: Vercel 배포 📋

- [ ] Vercel 프로젝트 생성 (GitHub 연동)
- [ ] 환경변수 설정
  - `NOTION_API_KEY`
  - `NOTION_DATABASE_ID`
  - `AUTH_SECRET`
  - `AUTH_TEST_EMAIL` (선택)
  - `AUTH_TEST_PASSWORD` (선택)
- [ ] 빌드 설정 확인
- [ ] 배포 실행

### Step 7: 배포 후 검증 📋

- [ ] 로그인/로그아웃 기능 확인
- [ ] 대시보드 데이터 로드 확인
- [ ] 목록/상세 페이지 정상 작동
- [ ] PDF 다운로드 기능 확인
- [ ] 보안 헤더 확인
- [ ] 성능 지표 모니터링

---

## 변경사항 요약

### 생성된 파일

- `vercel.json` - Vercel 배포 설정
- `.vercelignore` - 배포 제외 파일 목록
- `docs/guides/deployment-guide.md` - 배포 단계별 가이드
- `docs/guides/environment-variables.md` - 환경변수 설정 가이드
- `docs/DEPLOYMENT-CHECKLIST.md` - 배포 체크리스트

### 수정된 파일

- `.env.example` - 환경변수 설정 가이드 추가

### 완료된 작업

1. ✅ 프로덕션 빌드 검증
2. ✅ E2E 테스트 실행 (Playwright)
3. ✅ Vercel 배포 설정 파일 생성
4. ✅ 배포 및 운영 문서 작성

---

## 테스트 체크리스트

### 로컬 환경 검사

- ✅ `npm run check-all` 통과
- ✅ `npm run build` 성공
- ✅ TypeScript 타입 에러 없음
- ✅ ESLint 검사 통과
- ✅ Prettier 포맷 검사 통과

### E2E 테스트

- ✅ 개발 서버 정상 작동
- ✅ Playwright 테스트 실행 가능
- ✅ 로그인 플로우 테스트
- ✅ 데이터 조회 테스트
- ✅ PDF 다운로드 테스트

### 배포 전 검증

- ✅ 환경변수 문서 완성
- ✅ 배포 가이드 문서 완성
- ✅ 배포 체크리스트 작성
- ✅ Vercel 설정 파일 생성

---

## 다음 단계

1. **GitHub 커밋**

   ```bash
   git add .
   git commit -m "chore: 배포 설정 (vercel.json, .vercelignore, 문서)"
   git push origin main
   ```

2. **Vercel 배포**
   - Vercel 대시보드에서 GitHub 저장소 연동
   - 환경변수 설정
   - 배포 시작

3. **배포 후 검증**
   - 프로덕션 URL 접속
   - 전체 기능 테스트
   - 성능 모니터링 시작

4. **운영 관리**
   - 정기적 패키지 업데이트
   - 보안 취약점 모니터링
   - 사용자 피드백 수집

---

## 관련 문서

- `docs/guides/deployment-guide.md` - 배포 단계별 상세 가이드
- `docs/guides/environment-variables.md` - 환경변수 설정 및 관리
- `docs/DEPLOYMENT-CHECKLIST.md` - 배포 체크리스트
- `docs/ROADMAP.md` - 프로젝트 로드맵

---

## 배포 환경 정보

| 항목               | 정보                 |
| ------------------ | -------------------- |
| **호스팅 플랫폼**  | Vercel               |
| **프레임워크**     | Next.js 15.5.3       |
| **런타임**         | Node.js 20+          |
| **데이터베이스**   | Notion               |
| **인증**           | NextAuth.js v5       |
| **예상 배포 시간** | 2-5분                |
| **예상 빌드 크기** | ~180 kB (JavaScript) |

---

## 유지보수 계획

### 정기 업무

- **주 1회**: 배포 로그 확인
- **월 1회**: 패키지 업데이트 검사
- **분기별**: 보안 키 로테이션
- **연 2회**: 성능 리뷰

### 모니터링

- Vercel Analytics로 Web Vitals 추적
- 배포 실패 시 알림 설정
- 성능 저하 시 자동 알림

### 문제 해결

- 배포 실패 → 빌드 로그 확인
- 데이터 미로드 → Notion API 권한 확인
- 로그인 실패 → AUTH_SECRET 재생성

---

**최종 완료**: -
**담당자**: -
**리뷰어**: -
