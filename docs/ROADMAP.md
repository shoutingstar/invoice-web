# Invoice Web 개발 로드맵

노션 데이터베이스의 견적서를 웹으로 조회하고 PDF로 다운로드할 수 있는 웹 서비스 개발 로드맵

## 개요

Invoice Web은 영업팀과 고객사를 위한 견적서 조회 서비스로 다음 기능을 제공합니다:

- **사용자 인증**: 이메일 기반 로그인 및 세션 관리
- **대시보드**: 로그인 후 메인 진입점, 통계 정보 및 최근 견적서 표시
- **견적서 목록 조회**: Notion API 연동 카드 형식 목록, 검색/필터링, 페이지네이션
- **견적서 상세 조회**: 견적 항목 테이블, 담당자 정보, 비고 등 전체 정보 표시
- **PDF 다운로드**: 견적서 상세 정보를 PDF로 변환 및 다운로드
- **클라이언트 공유 링크**: 인증 없이 견적서를 조회할 수 있는 공유 링크 기능
- **다크모드**: 라이트/다크/시스템 테마 지원

## 기술 스택

- **Framework**: Next.js 16.2.1 (App Router + Turbopack)
- **Runtime**: React 19 + TypeScript 5
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york style)
- **Forms**: React Hook Form + Zod
- **API**: Notion API (@notionhq/client)
- **인증**: NextAuth.js v5
- **PDF**: html2pdf.js (클라이언트사이드)
- **테마**: next-themes

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `017-admin-client-role.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)
   - 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조
   - 초기 상태의 샘플로 `000-sample.md` 참조

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 완료로 표시

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 ✅

- **Task 001: 라우트 구조 및 페이지 골격 생성** ✅ - 완료
  - See: `/tasks/001-route-structure.md`
  - ✅ App Router 기반 전체 라우트 구조 생성 (대시보드, 견적서 목록, 견적서 상세)
  - ✅ `(auth)` 그룹 라우트로 인증 필요 페이지 분리
  - ✅ 각 페이지의 빈 껍데기 파일 생성 (page.tsx, layout.tsx, loading.tsx, error.tsx)
  - ✅ 인증 영역 공통 레이아웃 컴포넌트 골격 구현
  - ✅ `not-found.tsx` 글로벌 404 페이지 생성

- **Task 002: 타입 정의 및 데이터 모델 설계** ✅ - 완료
  - See: `/tasks/002-type-definitions.md`
  - ✅ TypeScript 인터페이스 정의 (`invoice.ts`, `user.ts`, `api.ts`)
  - ✅ API 응답/요청 타입 정의
  - ✅ Zod 스키마 정의 (로그인 폼, 검색 필터)
  - ✅ 상수 파일 생성 (상태값, 페이지네이션 설정, 라우트 경로)

### Phase 2: UI/UX 완성 (더미 데이터 활용) ✅

- **Task 003: 공통 컴포넌트 및 레이아웃 구현** ✅ - 완료
  - See: `/tasks/003-common-components.md`
  - ✅ 인증 영역 공통 레이아웃 완성 (헤더, 네비게이션, 사용자 정보, 로그아웃)
  - ✅ 공통 UI 컴포넌트: Table, Pagination, EmptyState, StatusBadge
  - ✅ InvoiceCard, InvoiceDetail 컴포넌트
  - ✅ 더미 데이터 생성 유틸리티

- **Task 004: 대시보드 페이지 UI 구현** ✅ - 완료
  - See: `/tasks/004-dashboard-ui.md`
  - ✅ 통계 카드 4개, 최근 견적서 미리보기, 반응형 디자인

- **Task 005: 견적서 목록 페이지 UI 구현** ✅ - 완료
  - See: `/tasks/005-invoice-list-ui.md`
  - ✅ 카드 형식 목록, 페이지네이션, 검색/필터 UI, 로딩 스켈레톤

- **Task 006: 견적서 상세 페이지 UI 구현** ✅ - 완료
  - See: `/tasks/006-invoice-detail-ui.md`
  - ✅ 견적서 상세 정보, 항목 테이블, PDF 다운로드 버튼, 반응형 디자인

- **Task 007: 에러 페이지 및 예외 상태 UI 구현** ✅ - 완료
  - See: `/tasks/007-error-pages-ui.md`
  - ✅ 404, 403, 500 에러 페이지, 에러 바운더리 컴포넌트

### Phase 3: 핵심 기능 구현 ✅

- **Task 008: 인증 시스템 구축 (NextAuth.js v5)** ✅ - 완료
  - See: `/tasks/008-authentication.md`
  - ✅ NextAuth.js v5 Credentials Provider, JWT 세션 관리
  - ✅ 인증 미들웨어, 로그인/로그아웃 Server Actions
  - ✅ E2E 테스트 완료

- **Task 009: Notion API 연동 및 견적서 데이터 조회** ✅ - 완료
  - See: `/tasks/009-notion-api.md`
  - ✅ Notion API 클라이언트 설정, 목록/상세/통계 조회 함수
  - ✅ 데이터 매퍼, 에러 핸들링, E2E 테스트 검증

- **Task 010: 견적서 목록 페이지 데이터 연동** ✅ - 완료
- **Task 011: 견적서 상세 페이지 데이터 연동** ✅ - 완료
- **Task 012: 대시보드 페이지 데이터 연동** ✅ - 완료
- **Task 013: PDF 다운로드 기능 구현** ✅ - 완료
- **Task 013-1: 핵심 기능 통합 테스트** ✅ - 완료

### Phase 4: 고급 기능 및 최적화 ✅

- **Task 014: 검색 및 필터링 기능 구현** ✅ - 완료
  - See: `/tasks/014-search-filter.md`
  - ✅ 견적서 번호/고객사명 검색, 상태 필터링, URL 쿼리 파라미터 연동

- **Task 015: 성능 최적화 및 사용자 경험 개선** ✅ - 완료
  - See: `/tasks/015-performance.md`
  - ✅ fetch 캐싱 전략, On-Demand Revalidation, 메타데이터 최적화, 접근성 개선

- **Task 016: 배포 및 운영 환경 구성** ✅ - 완료
  - See: `/tasks/016-deployment.md`
  - ✅ Next.js 보안 업그레이드, Vercel 배포 설정, 환경변수/배포 가이드 작성

### Phase 5: 고도화 - 역할 분리, 공유 기능, 다크모드

- **Task 017: 관리자/클라이언트 역할 분리 및 UI 개선** ✅ - 완료
  - ✅ 현재 단일 레이아웃을 관리자 전용으로 명칭 및 UI 변경
  - ✅ User 타입에 역할(role) 필드 확장 (`admin` | `client`)
  - ✅ 관리자 전용 AuthHeader에 "관리자" 뱃지 표시
  - ✅ 관리자 대시보드 레이아웃에 관리 메뉴 추가 (견적서 관리, 공유 링크 관리)
  - ✅ 역할 기반 라우트 보호 미들웨어 구현 (관리자 전용 경로 접근 제어)
  - ✅ 세션에 역할 정보 포함하도록 NextAuth.js 콜백 수정
  - ✅ 역할별 네비게이션 메뉴 분기 렌더링

- **Task 018: 클라이언트 공유 링크 기능 구현** ✅ - 완료
  - ✅ 견적서 공유 토큰 생성 및 관리 시스템 구축 (Stateless HMAC-SHA256)
  - ✅ 공유 링크 생성 API Route 구현 (`/api/invoices/[id]/share`)
  - ✅ Web Crypto API 기반 토큰 저장소 구현 (DB 불필요)
  - ✅ 견적서 상세 페이지에 "공유" 버튼 추가
  - ✅ 클립보드 복사 기능 및 토스트 알림 구현 (Sonner)
  - ✅ 공유 링크용 공개 페이지 구현 (`/share/[token]`)
  - ✅ 공유 페이지 전용 레이아웃 (인증 불필요, 읽기 전용 견적서 상세 뷰)
  - ✅ 공유 링크 만료 기간 설정 (기본 7일)
  - ✅ 위조 토큰 및 만료 토큰 접근 차단 (404)
  - ✅ Playwright를 활용한 공유 링크 E2E 테스트 (6/6 통과)

- **Task 019: 다크모드 기능 완성 및 전체 UI 테마 적용** ✅ - 완료
  - ✅ 기존 ThemeProvider, ThemeToggle 컴포넌트 활용 (이미 설치됨)
  - ✅ AuthHeader에 ThemeToggle 버튼 통합 (로그아웃 버튼 좌측에 배치)
  - ✅ 로그인 페이지에 ThemeToggle 추가 (우측 상단)
  - ✅ globals.css에 다크모드 CSS 변수 점검 및 누락 스타일 보완
  - ✅ 모든 페이지/컴포넌트의 다크모드 호환성 검증
    - ✅ 대시보드: 통계 카드, 최근 견적서 배경/텍스트 대비
    - ✅ 견적서 목록: InvoiceCard 호버 상태, StatusBadge 색상
    - ✅ 견적서 상세: InvoiceDetail 테이블 border, 합계 섹션
    - ✅ 로그인/회원가입: 폼 필드 배경, 에러 메시지 가시성
    - ✅ 에러 페이지: EmptyState 아이콘/텍스트 색상
  - ✅ PDF 다운로드 시 라이트 테마 강제 적용 (인쇄용)
  - ✅ 사용자 테마 선택 localStorage 영속화 확인 (next-themes 기본 동작)
  - ✅ Playwright MCP로 라이트/다크 모드 전환 및 UI 일관성 테스트

- **Task 020: Phase 5 통합 테스트** ✅ - 완료
  - ✅ Playwright E2E 테스트 스위트 작성 (`tests/e2e/phase5-integration.spec.ts`, `phase5-share.spec.ts`, `phase5-role.spec.ts`)
  - ✅ 관리자 로그인 후 역할 기반 UI 검증 (관리자 뱃지, 관리 메뉴 표시)
  - ✅ 공유 링크 전체 플로우 테스트
    - ✅ 관리자가 견적서 상세에서 공유 링크 생성
    - ✅ 클립보드 복사 동작 확인
    - ✅ 공유 링크로 비인증 사용자 접근 시 견적서 조회 성공
    - ✅ 만료/위조 토큰 접근 시 404 페이지 표시
  - ✅ 다크모드 전체 페이지 테스트
    - ✅ 라이트 모드 → 다크 모드 전환 후 주요 페이지 렌더링 검증
    - ✅ 공유 페이지에서 다크모드 적용 확인
  - ✅ 역할 기반 접근 제어 테스트 (관리자 전용 경로 비인가 접근 차단)
  - ✅ 레이아웃 및 버튼 배치 테스트
    - ✅ PDF 다운로드 버튼과 공유 버튼이 같은 행에 표시
    - ✅ 공유 페이지에 "공유된 견적서" 안내 표시

---

## 진행 상황

**최종 업데이트**: 2026-03-24

**진행 상황**: Phase 1-4 완료 (16/16 Tasks) | Phase 5 완료 (4/4 Tasks) ✅

- ✅ Phase 1: 애플리케이션 골격 구축 (Task 001-002)
- ✅ Phase 2: UI/UX 완성 (Task 003-007)
- ✅ Phase 3: 핵심 기능 구현 (Task 008-013-1)
- ✅ Phase 4: 고급 기능 및 최적화 (Task 014-016)
- ✅ Phase 5: 고도화 - 역할 분리, 공유 기능, 다크모드 (Task 017-020) ✅ 완료
  - ✅ Task 017: 관리자/클라이언트 역할 분리 및 UI 개선 - 완료
  - ✅ Task 018: 클라이언트 공유 링크 기능 구현 - 완료
  - ✅ Task 019: 다크모드 기능 완성 및 전체 UI 테마 적용 - 완료
  - ✅ Task 020: Phase 5 통합 테스트 - 완료
