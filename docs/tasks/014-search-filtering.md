# Task 014: 검색 및 필터링 기능 구현

**상태**: ✅ 완료 (2026-03-24)

**Phase**: Phase 4 - 고급 기능 및 최적화

---

## 개요

견적서 목록 페이지에서 사용자가 검색어와 상태 필터를 사용하여 견적서를 찾을 수 있는 기능 구현

---

## 요구사항

### 기능 요구사항

1. **검색 기능**
   - 견적서 번호 검색 (부분 매칭)
   - 고객사명 검색 (부분 매칭)
   - Enter 키 또는 검색 버튼으로 검색 실행

2. **상태 필터링**
   - 상태 선택: 대기, 승인완료, 발송완료, 작성중
   - 모든 상태 옵션 제공

3. **URL 쿼리 파라미터 관리**
   - `?search=keyword` 형식으로 검색어 저장
   - `?status=대기` 형식으로 상태 필터 저장
   - 여러 파라미터 조합 지원 (`?search=INV&status=대기`)
   - 필터 변경 시 페이지 번호를 1로 초기화

4. **사용자 경험**
   - 검색/필터 입력 필드가 기본값으로 표시
   - 필터 적용 중 초기화 버튼 표시
   - 검색 결과 없음 시 적절한 UI 메시지

---

## 구현 완료 내용

### ✅ 1단계: InvoiceFilter 컴포넌트 구현

**파일**: `src/components/invoices/invoice-filter.tsx`

```typescript
// 주요 기능
- useState로 검색어와 상태 로컬 관리
- handleSearch: 검색 버튼 또는 Enter 키로 실행
- handleStatusChange: Select 변경 시 즉시 URL 업데이트
- handleReset: 모든 필터 초기화
- useRouter().push()로 URL 쿼리 파라미터 동기화
```

**구현 상세**:

- 검색 입력 필드 + 검색 버튼
- 상태 선택 Select (모든 상태, 대기, 승인완료, 발송완료, 작성중)
- 초기화 버튼 (필터 적용 시에만 표시)
- 페이지네이션 초기화 (`page=1`)

### ✅ 2단계: 서버사이드 필터 로직 구현

**파일**: `src/lib/api/notion-invoices.ts`

```typescript
// Notion API 필터 구성
- 상태 필터: select.equals (정확 매칭)
- 검색 필터:
  * rich_text.contains (고객사명)
  * title.contains (견적 번호)
  * or 연산으로 조합
- 필터 조합: and 연산으로 모두 적용
```

**구현 상세**:

- `fetchInvoices({ search, status, page, limit })` 함수
- Notion 필터 객체 생성 (lines 78-109)
- Mock 데이터 페일오버 (Notion API 실패 시)
- 앱 레벨에서 페이지네이션 처리

### ✅ 3단계: 페이지 컴포넌트 통합

**파일**: `src/app/(auth)/invoices/page.tsx`

```typescript
// URL 쿼리 파라미터 읽기
- searchParams.search (검색어)
- searchParams.status (상태 필터)
- searchParams.page (페이지 번호)

// API 호출 시 파라미터 전달
- fetchInvoices({ search, status, page, limit })

// 결과 렌더링
- 카드 그리드 또는 EmptyState
- 페이지네이션 (검색/필터 파라미터 유지)
```

### ✅ 4단계: E2E 테스트 작성

**파일**: `tests/e2e/phase4-search-filter.spec.ts`

테스트 케이스:

1. T1: 검색어 입력 및 검색 버튼 클릭
2. T2: Enter 키로 검색
3. T3: 상태 필터 선택
4. T4: 검색 + 상태 필터 조합
5. T5: 초기화 버튼 동작
6. T6: 검색 결과 없음 상태
7. T7: 페이지네이션과 검색 파라미터 유지

---

## 핵심 코드 플로우

### 검색 프로세스

```
사용자 입력 (검색어 또는 필터)
  ↓
InvoiceFilter 컴포넌트 (클라이언트)
  ↓
router.push(`/invoices?search=...&status=...&page=1`)
  ↓
InvoicesPage 서버 컴포넌트
  ↓
fetchInvoices({ search, status, page, limit })
  ↓
Notion API 쿼리 (필터 적용)
  ↓
결과 렌더링 (카드 그리드 또는 EmptyState)
```

### URL 쿼리 파라미터 관리

```
초기 상태
/invoices

검색만
/invoices?search=INV-2026

필터만
/invoices?status=대기

조합
/invoices?search=INV-2026&status=대기&page=2

초기화
/invoices (검색/필터 제거)
```

---

## 기술 세부사항

### Notion API 필터 구조

**단일 필터**:

```json
{
  "property": "상태",
  "select": { "equals": "대기" }
}
```

**복합 검색 필터 (OR)**:

```json
{
  "or": [
    { "property": "고객사명", "rich_text": { "contains": "LX" } },
    { "property": "견적 번호", "title": { "contains": "INV" } }
  ]
}
```

**최종 필터 (AND)**:

```json
{
  "and": [
    { "property": "상태", "select": { "equals": "대시" } },
    {
      "or": [
        { "property": "고객사명", "rich_text": { "contains": "LX" } },
        { "property": "견적 번호", "title": { "contains": "INV" } }
      ]
    }
  ]
}
```

### Mock 데이터 페일오버

Notion API 연결 실패 시 자동으로 Mock 데이터에서:

- 검색어로 invoiceNumber/customerName 필터링
- 상태로 status 필터링
- 페이지네이션 처리

---

## 테스트 체크리스트

### 기능 검증

- ✅ 검색어로 견적서 번호 검색
- ✅ 검색어로 고객사명 검색
- ✅ Enter 키로 검색 실행
- ✅ 검색 버튼으로 검색 실행
- ✅ 상태 필터 선택 (모든 상태)
- ✅ 검색 + 상태 필터 조합
- ✅ 초기화 버튼으로 모든 필터 제거
- ✅ 검색 결과 없음 시 EmptyState 표시
- ✅ 필터 변경 시 page=1로 초기화
- ✅ 페이지 이동 시 search/status 파라미터 유지

### 엣지 케이스

- ✅ 빈 검색어 입력 (검색 안 됨)
- ✅ 존재하지 않는 검색어 (EmptyState)
- ✅ 모든 상태 필터 (전체 조회)
- ✅ Notion API 실패 시 Mock 데이터 사용

### 성능

- ✅ Notion API 필터로 서버사이드 처리
- ✅ 불필요한 페이지네이션 요청 방지
- ✅ 캐싱 전략 (기본 Next.js)

---

## 코드 리뷰 포인트

### 강점

1. **명확한 분리**: 클라이언트(입력), 서버(필터링) 로직 분리
2. **안정성**: Mock 데이터 페일오버로 API 실패 대응
3. **UX**: Enter 키 지원, 초기화 버튼으로 사용성 향상
4. **URL 상태 관리**: 북마크/공유 가능하도록 URL에 상태 저장

### 개선 가능 영역

1. **입력 검증**: 특수 문자 정규화 (나중에 필요시)
2. **검색 히스토리**: 최근 검색어 저장 (선택적)
3. **고급 필터**: 날짜 범위, 금액 범위 필터 (Phase 5)

---

## 빌드 및 배포

### 빌드 상태

```
✅ npm run build - 성공
✅ 타입 체크 - 성공
✅ ESLint - 성공
```

### 관련 파일 변경

| 파일                                         | 상태    | 설명               |
| -------------------------------------------- | ------- | ------------------ |
| `src/components/invoices/invoice-filter.tsx` | ✅ 기존 | 클라이언트 필터 UI |
| `src/lib/api/notion-invoices.ts`             | ✅ 기존 | Notion 필터 로직   |
| `src/app/(auth)/invoices/page.tsx`           | ✅ 기존 | 페이지 통합        |
| `tests/e2e/phase4-search-filter.spec.ts`     | ✅ 신규 | E2E 테스트         |

---

## 다음 단계

- **Task 015**: 성능 최적화 및 사용자 경험 개선
  - Notion API 캐싱 전략
  - 페이지 전환 애니메이션
  - 접근성(a11y) 개선

---

**완료 일시**: 2026-03-24
**구현자**: Claude Code
**검증 상태**: ✅ 코드 리뷰 완료, E2E 테스트 작성 완료
