# Invoice Web - AI 에이전트 개발 가이드 (shrimp-rules.md)

> 이 문서는 Claude Code AI 에이전트가 Invoice Web 프로젝트에서 효율적으로 작업하기 위한 규칙을 정의합니다.
> 사용자 문서가 아니며, 개발 중 의사결정과 구현 패턴을 위한 가이드입니다.

---

## 1. 프로젝트 개요 (Project Overview)

### 프로젝트 목적
- **Invoice Web**: 노션 데이터베이스에서 관리되는 견적서를 웹으로 조회하고 PDF로 다운로드하는 서비스
- **대상 사용자**: 중소 건설사/서비스사의 영업팀 및 고객사
- **핵심 기능**: 로그인 → 대시보드 → 견적서 목록 → 상세 조회 → PDF 다운로드

### 기술 스택
| 항목 | 기술 |
|------|------|
| **Framework** | Next.js 15.5.3 (App Router + Turbopack) |
| **Runtime** | React 19.1.0 + TypeScript 5.x |
| **Styling** | TailwindCSS v4 + shadcn/ui (new-york) |
| **Forms** | React Hook Form v7 + Zod v4 |
| **Components** | Radix UI + Lucide Icons |
| **Build** | Turbopack (dev/prod 모두) |

### 개발 명령어
- `npm run dev` - 개발 서버 (Turbopack)
- `npm run build` - 프로덕션 빌드
- `npm run check-all` - 모든 검사 실행 (권장)
- `npm run lint:fix` - ESLint 자동 수정
- `npm run format` - Prettier 포매팅

---

## 2. 프로젝트 아키텍처 (Project Architecture)

### 디렉토리 구조 및 역할

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── layout.tsx          # Root 레이아웃 (프로바이더 설정)
│   ├── page.tsx            # 홈 페이지 (랜딩 페이지)
│   ├── login/page.tsx       # 로그인 페이지
│   └── signup/page.tsx      # 회원가입 페이지
│
├── components/             # 재사용 가능한 React 컴포넌트
│   ├── ui/                 # shadcn/ui 기본 컴포넌트들
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── sonner.tsx
│   │   └── ... (shadcn CLI 추가 컴포넌트)
│   ├── layout/             # 레이아웃 컴포넌트
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── container.tsx
│   ├── navigation/         # 네비게이션 컴포넌트
│   │   ├── main-nav.tsx
│   │   └── mobile-nav.tsx
│   ├── providers/          # Context & Provider 컴포넌트
│   │   └── theme-provider.tsx
│   ├── sections/           # 페이지 섹션 컴포넌트
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   └── cta.tsx
│   ├── login-form.tsx      # 로그인 폼 (도메인 컴포넌트)
│   ├── signup-form.tsx     # 회원가입 폼
│   └── ... (기타 도메인 컴포넌트)
│
├── lib/                    # 유틸리티 함수 및 설정
│   ├── utils.ts            # 스타일링 유틸 (cn, clsx 등)
│   └── env.ts              # 환경 변수 관리
│
├── hooks/                  # (향후) 커스텀 React Hooks
├── types/                  # (향후) 공유 TypeScript 타입
└── globals.css             # 글로벌 Tailwind 스타일

docs/
├── PRD.md                  # 제품 요구사항 문서
├── ROADMAP.md              # 개발 로드맵
└── guides/                 # 개발 가이드
    ├── project-structure.md
    ├── styling-guide.md
    ├── component-patterns.md
    ├── nextjs-15.md
    └── forms-react-hook-form.md
```

### 파일 추가 시 규칙
- **페이지 컴포넌트**: `src/app/[feature]/page.tsx`
- **일반 컴포넌트**: `src/components/[category]/component-name.tsx` (kebab-case)
- **유틸리티 함수**: `src/lib/feature-utils.ts`
- **Hooks**: `src/hooks/use-feature-name.ts` (향후)
- **타입 정의**: `src/types/feature.types.ts` (향후)

---

## 3. 코드 표준 (Code Standards)

### TypeScript 규칙
- **항상 TypeScript 사용**: `.tsx` 또는 `.ts` 확장자 필수
- **Type 추론 활용**: 컴파일러가 타입을 추론할 수 있으면 명시적 타입 생략 가능
- **Union/Interface 선호**: type 대신 interface 우선 사용 (shadcn 패턴)
- **Strict Mode**: `tsconfig.json`의 strict 설정 준수

```typescript
// ✅ Good: React.FC는 사용 권장 아님
export function LoginForm() {
  // ...
}

// ✅ Good: 명시적 props 타입
interface CardProps {
  title: string
  description?: string
}

// ❌ Avoid: any 사용
const data: any = fetchData()
```

### 파일명 규칙
- **컴포넌트**: kebab-case (예: `login-form.tsx`, `mobile-nav.tsx`)
- **유틸리티**: kebab-case (예: `env.ts`, `utils.ts`)
- **디렉토리**: kebab-case (예: `src/components/ui`)
- **Index 파일**: 컴포넌트 라이브러리화 시 `index.ts` 사용

### 코드 포매팅
- **Prettier 자동 포매팅**: 2칸 들여쓰기 (설정됨)
- **Tailwind 클래스 정렬**: Prettier + tailwindcss 플러그인이 자동 정렬
- **Import 정렬**: ESLint 설정에 따라 자동 정렬
- **최대 라인 길이**: 설정되지 않음 (자유)

---

## 4. 컴포넌트 구현 표준 (Component Implementation)

### 클라이언트 vs 서버 컴포넌트

**서버 컴포넌트 (기본값)**
- 'use client' 지시문 없음
- 데이터베이스/API 직접 접근 가능
- 환경 변수 접근 가능 (서버 전용)

**클라이언트 컴포넌트**
- 'use client' 지시문 필수 (최상단)
- State, Effect, Event Handler 필요 시 사용
- Form, Dialog, Dropdown 등 대부분의 인터랙티브 컴포넌트

```typescript
// ✅ Good: 클라이언트 컴포넌트
'use client'

import { useState } from 'react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  // ...
}

// ✅ Good: 서버 컴포넌트 (페이지)
export default async function InvoicePage({
  params,
}: {
  params: { id: string }
}) {
  // 서버에서만 실행 가능
  const invoice = await fetchInvoice(params.id)
  return <InvoiceDetail invoice={invoice} />
}
```

### shadcn/ui 컴포넌트 사용

**사용 가능한 컴포넌트**
- `Button`, `Input`, `Card`, `Form`, `Dialog`, `Select`, `Label` 등
- `Sonner` (토스트 알림)
- 추가 컴포넌트: `npx shadcn@latest add [component-name]`

**패턴 예시**
```typescript
// ✅ Form with shadcn components
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Form은 shadcn을 먼저 import, 그 다음 shadcn이 아닌 것들
```

---

## 5. 폼 & 검증 표준 (Form & Validation)

### React Hook Form + Zod 조합

**필수 패턴**
1. Zod 스키마 정의
2. `useForm`으로 form 초기화
3. `FormField` + `FormControl` + `FormMessage` 조합
4. 타입 안정성: `z.infer<typeof schema>`

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// 1️⃣ Zod 스키마
const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
})

// 2️⃣ 타입 추론
type LoginFormValues = z.infer<typeof loginSchema>

// 3️⃣ 컴포넌트
export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    // Server Action 호출 또는 API 요청
    const result = await loginAction(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">로그인</Button>
      </form>
    </Form>
  )
}
```

### 검증 규칙
- **필드 검증**: Zod에서 처리 (폼 레벨)
- **비동기 검증**: refine/superRefine 사용
- **에러 메시지**: 한글로 작성
- **커스텀 에러**: `FormMessage`가 자동 표시

---

## 6. 스타일링 표준 (Styling Standards)

### TailwindCSS v4 규칙

**클래스 작성**
- Tailwind 클래스만 사용 (CSS 파일/모듈 금지)
- `cn()` 유틸로 조건부 클래스 조합
- Prettier가 클래스 순서 자동 정렬

```typescript
// ✅ Good: cn() 유틸 사용
import { cn } from '@/lib/utils'

export function Button({ disabled, className }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md bg-blue-500 text-white',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      Click
    </button>
  )
}

// ❌ Avoid: styled-components, emotion, CSS modules
import styled from 'styled-components' // ❌
import styles from './button.module.css' // ❌
```

### 색상 & 디자인 토큰
- Tailwind 기본 색상 사용 (커스터마이징 불필요)
- shadcn 테마 변수 활용 (`bg-background`, `text-foreground` 등)
- Dark mode: `next-themes` 라이브러리로 관리 (이미 설정됨)

---

## 7. Next.js 15 App Router 표준 (Framework Usage)

### 디렉토리 구조 패턴

**동적 라우트**
```
src/app/
├── [feature]/
│   ├── page.tsx          # /feature
│   ├── [id]/
│   │   └── page.tsx      # /feature/:id
│   └── layout.tsx        # /feature 레이아웃
```

### Server Actions 사용 (API 라우트 대신)

**패턴**
```typescript
// src/app/actions.ts
'use server'

import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function loginAction(values: z.infer<typeof loginSchema>) {
  // 데이터베이스 접근
  // 세션 관리
  // 리다이렉트 등
}
```

**클라이언트에서 호출**
```typescript
'use client'

import { loginAction } from '@/app/actions'

export function LoginForm() {
  async function onSubmit(values) {
    const result = await loginAction(values)
  }
}
```

### 메타데이터 설정
- Root Layout에서 전역 metadata 정의
- 페이지별: `generateMetadata()` 함수 사용

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: 'Invoice Web - 견적서 웹뷰',
  description: '노션 견적서를 웹에서 확인하고 PDF로 다운로드',
}
```

---

## 8. 핵심 파일 상호작용 (Key File Interactions)

### 파일 수정 시 함께 확인해야 할 파일

**타입 변경 시**
- src/types/[feature].types.ts 생성/수정
- 해당 타입을 사용하는 모든 컴포넌트 확인

**환경 변수 추가 시**
- src/lib/env.ts 수정
- .env.local (로컬 개발)
- .env.production (배포용)
- vercel 환경변수 설정 (배포 시)

**API/Server Action 추가 시**
- src/app/actions.ts 수정
- 관련 컴포넌트의 onSubmit 함수 확인
- 에러 처리 추가

**UI 컴포넌트 추가/수정 시**
- src/components/ui/[component].tsx
- shadcn 컴포넌트면 components.json 확인
- 사용 중인 페이지들 테스트

**스타일 변경 시**
- tailwind.config.ts (색상/토큰 변경)
- src/globals.css (글로벌 스타일)
- 영향 범위 확인 (다크 모드 등)

---

## 9. AI 의사결정 기준 (AI Decision-making Standards)

### 우선순위 기준

| 우선순위 | 기준 | 예시 |
|---------|------|------|
| 1 | **기존 패턴 따르기** | 이미 있는 컴포넌트와 동일한 구조 |
| 2 | **shadcn/ui 컴포넌트** | 커스텀 작성 전에 shadcn 확인 |
| 3 | **Server Components** | 가능한 한 서버 컴포넌트 사용 |
| 4 | **React Hook Form + Zod** | 모든 폼 검증에 사용 |
| 5 | **TailwindCSS만** | 다른 CSS 방식 사용 금지 |

### 의사결정 플로우

**새로운 컴포넌트 필요할 때**
1. shadcn에 있는가? → 있으면 추가
2. 기존 컴포넌트를 조합할 수 있는가? → 조합
3. 커스텀이 필수인가? → `'use client'` + Tailwind로 작성

**폼 필드 필요할 때**
1. shadcn/form + React Hook Form 사용
2. Zod 스키마 정의
3. FormField + FormControl + FormMessage 조합

**데이터 가져오기**
1. 페이지/레이아웃에서 가능한가? → 서버 컴포넌트
2. 클라이언트에서만 가능한가? → useEffect + fetch or Server Action
3. 반복되는가? → 커스텀 Hook (use-feature.ts)

---

## 10. 금지되는 패턴 (Prohibited Actions)

### ❌ 스타일링
- `styled-components`, `emotion` 등 CSS-in-JS 라이브러리 사용
- CSS modules (*.module.css) 생성
- Inline style prop 과다 사용 (1-2개만 가능)
- 새로운 CSS 파일 생성

### ❌ 컴포넌트 작성
- Props drilling 과다 (3단계 이상)
  - → Context API 또는 Server Components로 해결
- 기본 UI는 커스텀 작성 (Button, Input 등)
  - → shadcn/ui 사용
- React.FC 타입 명시 (타입 추론 활용)

### ❌ 폼 처리
- 직접 state 관리 (useState로 각 필드 관리)
  - → React Hook Form 사용
- HTML5 검증만 사용
  - → Zod 스키마 검증 필수
- API 라우트에서 검증
  - → Server Action에서 검증

### ❌ Next.js 패턴
- API 라우트 (src/app/api/) 신규 생성
  - → Server Actions 사용
- 클라이언트 전용 환경 변수 (REACT_APP_* 형식)
  - → next.config.ts에서 직렬화
- getServerSideProps, getStaticProps
  - → async/await 또는 Server Actions

### ❌ 데이터
- 노션 API 직접 호출 (클라이언트에서)
  - → Server Action을 통해 서버에서만 호출
- 민감한 정보 클라이언트에 노출
  - → 서버에서 처리 후 필요한 것만 전달

### ❌ 의존성
- 설정 변경 (eslint, prettier, tsconfig 함부로 수정)
  - → 기존 설정 유지
- 새로운 패키지 설치 (요청 없이)
  - → 사용자 승인 필요

---

## 11. 배포 & 빌드 (Build & Deployment)

### 빌드 확인 체크리스트
```bash
npm run check-all    # TypeScript, ESLint, Prettier 모두 통과
npm run build        # 프로덕션 빌드 성공
```

### Vercel 배포 (권장)
- Next.js 자동 감지
- 환경 변수 설정 필수 (프로젝트 설정)
- 배포 전 `npm run build` 로컬 검증

### 환경 변수 관리
- **개발**: .env.local (git 무시됨)
- **배포**: Vercel Dashboard 설정
- **타입 안정성**: src/lib/env.ts에서 검증

---

## 12. 개발 가이드 참조

상세 내용은 다음 문서 참조:
- **프로젝트 요구사항**: @/docs/PRD.md
- **개발 로드맵**: @/docs/ROADMAP.md
- **Next.js 15 가이드**: @/docs/guides/nextjs-15.md
- **폼 처리 가이드**: @/docs/guides/forms-react-hook-form.md
- **스타일링 가이드**: @/docs/guides/styling-guide.md
- **컴포넌트 패턴**: @/docs/guides/component-patterns.md

---

**마지막 업데이트**: 2026-03-20
**적용 버전**: Next.js 15.5.3, React 19.1.0, TypeScript 5.x
