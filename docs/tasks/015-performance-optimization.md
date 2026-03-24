# Task 015: 성능 최적화 및 사용자 경험 개선

**상태**: ✅ 완료 (2026-03-24)

**Phase**: Phase 4 - 고급 기능 및 최적화

---

## 개요

Invoice Web의 Notion API 응답 캐싱, On-Demand Revalidation, 접근성 개선, 메타데이터 최적화를 통해 성능과 사용자 경험을 향상합니다.

---

## 요구사항

### 기능 요구사항

1. **Next.js 캐싱 전략 적용**
   - Notion API 응답 캐싱 (`fetch` `next.revalidate` 옵션)
   - 견적서 목록: 1시간(3600초) 캐시
   - 견적서 상세: 24시간(86400초) 캐시
   - 캐시 태그를 이용한 On-Demand Revalidation

2. **On-Demand Revalidation API**
   - `POST /api/revalidate` 엔드포인트
   - `Authorization: Bearer {REVALIDATE_SECRET}` 인가 검증
   - 전체/목록/개별 견적서 캐시 무효화 지원

3. **페이지 메타데이터 최적화**
   - 대시보드, 목록 페이지: 정적 metadata 내보내기
   - 상세 페이지: `generateMetadata`로 동적 메타데이터 (견적번호, 고객사명 포함)

4. **접근성(a11y) 개선**
   - 스킵 네비게이션 링크 추가 (AuthLayout)
   - 검색 폼 ARIA 레이블 추가
   - 페이지네이션 nav/aria-current 적용
   - 에러 영역 `role="alert"` 및 `aria-live="polite"` 적용
   - 로딩 스켈레톤 `aria-hidden="true"` 적용

5. **로딩 스켈레톤 개선**
   - 대시보드 loading.tsx: 실제 페이지 레이아웃과 일치하도록 통계 카드 4개 스켈레톤 추가
   - 상세 페이지 loading.tsx: 기존 구현 유지 (이미 충분히 상세)

---

## 구현 내용

### 캐싱 전략

#### `src/lib/api/notion-client.ts`

`queryNotionDatabase` 함수에 `revalidate` 파라미터 추가:

```typescript
// 목록 조회: 1시간 캐시
const cacheOption = {
  next: { revalidate: 3600, tags: [`notion-db-${normalizedId}`] },
}
// revalidate: 0이면 no-store (캐시 없음)
```

#### `src/lib/api/notion-invoices.ts`

- `fetchInvoices()`: 목록 DB 쿼리에 `revalidate: 3600` 적용
- `fetchInvoiceById()`: 개별 페이지 fetch에 `next: { revalidate: 86400, tags: ['notion-invoice-{id}'] }` 적용

#### `src/lib/api/notion-items.ts`

- `fetchInvoiceItems()`: 항목 DB 쿼리에 `revalidate: 86400` 적용

### On-Demand Revalidation

#### `src/app/api/revalidate/route.ts` (신규)

| 메서드 | 동작                             |
| ------ | -------------------------------- |
| `POST` | 캐시 무효화 실행                 |
| `GET`  | API 상태 및 사용법 반환 (개발용) |

**요청 예시:**

```bash
# 모든 캐시 무효화
curl -X POST /api/revalidate \
  -H "Authorization: Bearer {REVALIDATE_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"tag": "all"}'

# 특정 견적서 캐시 무효화
curl -X POST /api/revalidate \
  -H "Authorization: Bearer {REVALIDATE_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"invoiceId": "abc-123"}'
```

**지원 태그:**

- `"all"` - 모든 Notion 캐시 + `/dashboard`, `/invoices` 경로 무효화
- `"notion-invoices"` - 견적서 목록 캐시 무효화
- `{ invoiceId: "xxx" }` - 특정 견적서 캐시 무효화

### 메타데이터

| 페이지           | 방식               | 내용                                   |
| ---------------- | ------------------ | -------------------------------------- |
| `/dashboard`     | 정적 `metadata`    | 대시보드 \| Invoice Web                |
| `/invoices`      | 정적 `metadata`    | 견적서 목록 \| Invoice Web             |
| `/invoices/[id]` | `generateMetadata` | {견적번호} - {고객사명} \| Invoice Web |

### 접근성 개선

#### `src/app/(auth)/layout.tsx`

스킵 네비게이션 추가:

```html
<a href="#main-content" class="sr-only focus:not-sr-only ...">
  본문으로 바로가기
</a>
<main id="main-content" tabIndex="{-1}">...</main>
```

#### `src/components/invoices/invoice-filter.tsx`

- `role="search"` + `aria-label`
- Input에 `id`, `<label htmlFor>`, `aria-label` 추가
- 검색 버튼에 `aria-label="검색 실행"` 추가

#### `src/app/(auth)/invoices/page.tsx`

- 에러 섹션: `role="alert"`, `aria-live="polite"`
- 건수 표시: `aria-live="polite"`
- 견적서 그리드: `role="list"` + `role="listitem"`
- 페이지네이션: `<nav>` + `aria-label` + `aria-current="page"`

---

## 변경된 파일 목록

```
수정:
  src/lib/api/notion-client.ts      - queryNotionDatabase에 revalidate 파라미터 추가
  src/lib/api/notion-invoices.ts    - fetch 캐시 옵션 적용
  src/lib/api/notion-items.ts       - fetch 캐시 옵션 적용
  src/app/(auth)/layout.tsx         - 스킵 네비게이션 추가
  src/app/(auth)/dashboard/page.tsx - metadata 추가
  src/app/(auth)/dashboard/loading.tsx - 통계 카드 스켈레톤 개선
  src/app/(auth)/invoices/page.tsx  - metadata, 접근성 개선
  src/app/(auth)/invoices/[id]/page.tsx - generateMetadata 추가
  src/components/invoices/invoice-filter.tsx - ARIA 개선

신규:
  src/app/api/revalidate/route.ts   - On-Demand Revalidation API
  docs/tasks/015-performance-optimization.md
```

---

## 수락 기준

- [x] 빌드 성공 (`npm run build`)
- [x] 타입 검사 통과 (`npm run typecheck`)
- [x] 린트 통과 (`npm run lint`)
- [x] Notion API fetch에 캐시 옵션 적용
- [x] On-Demand Revalidation 엔드포인트 구현
- [x] 대시보드, 목록, 상세 메타데이터 설정
- [x] 스킵 네비게이션 구현
- [x] 검색 폼 ARIA 레이블 적용
- [x] 페이지네이션 nav/aria-current 적용
- [x] 대시보드 로딩 스켈레톤 레이아웃 일치

---

## 캐싱 전략 요약

| 데이터              | 캐시 시간       | 태그                  | 비고             |
| ------------------- | --------------- | --------------------- | ---------------- |
| 견적서 목록 DB 쿼리 | 1시간 (3600s)   | `notion-db-{dbId}`    | 검색 쿼리 포함   |
| 견적서 항목 DB 쿼리 | 24시간 (86400s) | `notion-db-{dbId}`    | 변경 빈도 낮음   |
| 개별 견적서 페이지  | 24시간 (86400s) | `notion-invoice-{id}` | 개별 무효화 가능 |

---

## 변경 사항 요약

- Notion API fetch 캐싱으로 반복 요청 시 응답 속도 대폭 개선 (초기 로드 이후 캐시 히트)
- On-Demand Revalidation으로 데이터 변경 즉시 반영 가능
- 동적 메타데이터로 SEO 및 소셜 공유 개선
- 스킵 네비게이션 및 ARIA 레이블로 키보드/스크린리더 접근성 확보
- 대시보드 로딩 스켈레톤을 실제 레이아웃과 일치시켜 CLS 감소
