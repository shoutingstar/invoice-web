# Notion 데이터베이스 설정 가이드

Invoice Web에서 필요한 Notion 데이터베이스 스키마를 설정하는 방법을 설명합니다.

---

## 📋 데이터베이스 구조 개요

Invoice Web은 **2개의 Notion 데이터베이스**를 사용합니다:

1. **Invoices** (견적서) - 메인 데이터베이스
2. **InvoiceItems** (견적 항목) - 하위 데이터베이스 (Inline과 Relation으로 연결)

---

## 🔧 Invoices (견적서) 데이터베이스

### 기본 정보
- **데이터베이스 이름**: Invoices
- **아이콘**: 📄
- **설명**: 고객 견적서 관리 데이터베이스

### 필수 속성 (Properties)

#### 1. **Title** (기본값)
- **타입**: Title
- **설명**: 견적서 고유 번호 + 고객사명 (자동)
- **예시**: `INV-2024-001 / ABC건설`
- **필수**: ✅ Yes

#### 2. **Invoice Number** (견적 번호)
- **타입**: Text
- **설명**: 견적서 번호 (예: INV-2024-001)
- **포맷**: INV-YYYY-NNN
- **필수**: ✅ Yes
- **고유값**: ✅ Yes

#### 3. **Customer Name** (고객사명)
- **타입**: Text
- **설명**: 거래처/고객사명
- **필수**: ✅ Yes
- **예시**: ABC건설, XYZ서비스

#### 4. **Customer Phone** (고객 연락처)
- **타입**: Phone Number
- **설명**: 고객사 연락처
- **필수**: ✅ Yes

#### 5. **Customer Email** (고객 이메일)
- **타입**: Email
- **설명**: 고객사 담당자 이메일
- **필수**: ❌ No

#### 6. **Created Date** (작성 날짜)
- **타입**: Date
- **설명**: 견적서 작성 날짜
- **필수**: ✅ Yes
- **기본값**: Today

#### 7. **Valid Until** (유효기간)
- **타입**: Date
- **설명**: 견적서 유효 기간 마감일
- **필수**: ✅ Yes

#### 8. **Status** (상태)
- **타입**: Select
- **설명**: 견적서 상태
- **옵션**:
  - 🟡 `Pending` (미승인) - Yellow
  - 🟢 `Approved` (승인됨) - Green
- **필수**: ✅ Yes
- **기본값**: Pending

#### 9. **Total Amount** (합계 금액)
- **타입**: Number
- **설명**: 견적서 총 금액
- **포맷**: Number with comma separator
- **필수**: ✅ Yes

#### 10. **Manager Name** (담당자명)
- **타입**: Text
- **설명**: 영업담당자명
- **필수**: ✅ Yes

#### 11. **Manager Email** (담당자 이메일)
- **타입**: Email
- **설명**: 영업담당자 이메일
- **필수**: ❌ No

#### 12. **Manager Phone** (담당자 연락처)
- **타입**: Phone Number
- **설명**: 영업담당자 연락처
- **필수**: ❌ No

#### 13. **Notes** (특수 요청사항/비고)
- **타입**: Rich Text
- **설명**: 추가 요청사항이나 메모
- **필수**: ❌ No

#### 14. **Items** (견적 항목 - 관계)
- **타입**: Relation
- **참조 데이터베이스**: InvoiceItems
- **관계**: Many
- **필수**: ✅ Yes
- **설명**: 이 견적서에 포함된 모든 항목

#### 15. **Item Count** (항목 수 - 롤업)
- **타입**: Rollup
- **소스**: Items
- **계산**: Count all
- **필수**: ❌ No
- **설명**: 항목 개수 (자동 계산)

#### 16. **Created By** (작성자)
- **타입**: Created by
- **설명**: 데이터베이스 작성자
- **필수**: ✅ Yes (자동)

#### 17. **Last Modified** (마지막 수정 날짜)
- **타입**: Last edited time
- **설명**: 마지막 수정 시간
- **필수**: ✅ Yes (자동)

### 데이터베이스 뷰 설정

#### View 1: Grid (All Invoices)
- **이름**: All Invoices
- **필터**: None
- **정렬**: Created Date (최신순)
- **표시 열**:
  - Invoice Number
  - Customer Name
  - Created Date
  - Total Amount
  - Status
  - Manager Name

#### View 2: Timeline
- **이름**: Timeline View
- **시간축**: Created Date
- **카드 제목**: Invoice Number
- **설명**: 작성 기간별 견적서 조회

#### View 3: Status
- **이름**: By Status
- **그룹**: Status
- **설명**: 상태별 견적서 분류

---

## 🔗 InvoiceItems (견적 항목) 데이터베이스

### 기본 정보
- **데이터베이스 이름**: InvoiceItems
- **아이콘**: 📝
- **설명**: 견적서 항목 상세 정보

### 필수 속성 (Properties)

#### 1. **Title** (기본값)
- **타입**: Title
- **설명**: 품명/서비스명
- **필수**: ✅ Yes

#### 2. **Quantity** (수량)
- **타입**: Number
- **설명**: 항목 수량
- **필수**: ✅ Yes

#### 3. **Unit Price** (단가)
- **타입**: Number
- **설명**: 항목 단가
- **포맷**: Number with comma
- **필수**: ✅ Yes

#### 4. **Amount** (금액)
- **타입**: Formula
- **수식**: `prop("Quantity") * prop("Unit Price")`
- **설명**: 자동 계산 금액 (수량 × 단가)
- **필수**: ✅ Yes (자동)

#### 5. **Description** (상세 설명)
- **타입**: Rich Text
- **설명**: 항목 상세 설명 (선택)
- **필수**: ❌ No

#### 6. **Invoice** (연관 견적서)
- **타입**: Relation
- **참조 데이터베이스**: Invoices
- **관계**: One (Many-to-One)
- **필수**: ✅ Yes
- **설명**: 이 항목이 속한 견적서

#### 7. **Order** (순서)
- **타입**: Number
- **설명**: 항목 표시 순서
- **필수**: ❌ No

#### 8. **Created At** (생성 날짜)
- **타입**: Created time
- **필수**: ✅ Yes (자동)

---

## 📊 데이터 구조 관계도

```
┌─────────────────────────────────┐
│      Invoices (견적서)            │
├─────────────────────────────────┤
│ • Invoice Number (고유)          │
│ • Customer Name                 │
│ • Customer Phone/Email          │
│ • Created Date                  │
│ • Valid Until                   │
│ • Status: Pending / Approved    │
│ • Total Amount                  │
│ • Manager Info                  │
│ • Notes                         │
│ • Items ──────────────────┐     │
│ • Item Count (롤업)       │     │
│ • Created By              │     │
└──────────────────────────┼──────┘
                           │
                    ┌──────┘
                    │ (One-to-Many)
                    │
┌──────────────────┴──────────────┐
│    InvoiceItems (견적 항목)      │
├──────────────────────────────────┤
│ • Title (품명/서비스명)          │
│ • Quantity (수량)               │
│ • Unit Price (단가)             │
│ • Amount (금액: 자동 계산)       │
│ • Description                   │
│ • Invoice (역관계)              │
│ • Order (순서)                  │
│ • Created At                    │
└──────────────────────────────────┘
```

---

## 🚀 설정 단계

### Step 1: Notion 데이터베이스 생성

1. **Invoices 데이터베이스 생성**
   - Notion Workspace에서 "New" → "Database"
   - 이름: `Invoices`
   - 타입: Table

2. **InvoiceItems 데이터베이스 생성**
   - 이름: `InvoiceItems`
   - 타입: Table

### Step 2: 속성 추가

**Invoices 데이터베이스**:
```
위 명세의 15개 속성 모두 추가
(Title은 기본으로 제공됨)
```

**InvoiceItems 데이터베이스**:
```
위 명세의 8개 속성 모두 추가
(Title은 기본으로 제공됨)
```

### Step 3: 관계 설정

1. Invoices의 **Items** (Relation)
   - 참조: InvoiceItems
   - Show on related database: ✅

2. InvoiceItems의 **Invoice** (Relation)
   - 참조: Invoices
   - 자동으로 양방향 관계 생성됨

### Step 4: 롤업 추가

Invoices에 **Item Count** (Rollup) 추가:
- 소스: Items (Relation)
- 계산 함수: Count all

### Step 5: 포뮬러 추가

InvoiceItems에 **Amount** (Formula) 추가:
- 수식: `prop("Quantity") * prop("Unit Price")`
- 포맷: Number with comma

---

## 🔐 API 권한 설정

### Notion Integration 생성

1. [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) 접속
2. "New integration" 클릭
3. 이름: `Invoice Web`
4. 권한 선택:
   - ✅ Read content
   - ✅ Read user information
   - ✅ Update user information
5. "Submit" → API 키 복사

### 데이터베이스 공유 설정

1. **Invoices** 데이터베이스 열기
2. "Share" → "Add people, emails, or integrations"
3. 위에서 생성한 `Invoice Web` integration 추가
4. 권한: **Can view**

5. **InvoiceItems** 데이터베이스도 동일하게 공유

### API 키 저장

`.env.local` 파일에 추가:
```bash
NOTION_API_KEY=ntn_xxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxx  # Invoices DB ID
```

---

## 🔍 데이터베이스 ID 확인 방법

### Invoices 데이터베이스 ID 확인

1. Notion에서 Invoices 데이터베이스 열기
2. URL 확인: `https://www.notion.so/{workspace_id}/{database_id}?...`
3. **database_id** 부분 복사
4. 형식: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (32자)

---

## 📝 샘플 데이터 입력

최소한 2-3개의 테스트 데이터를 입력하면 개발 중 테스트가 용이합니다.

### 샘플 견적서 1

| 속성 | 값 |
|------|-----|
| Invoice Number | INV-2024-001 |
| Customer Name | ABC건설 |
| Customer Phone | 02-1234-5678 |
| Created Date | 2024-03-01 |
| Valid Until | 2024-04-01 |
| Status | Pending |
| Total Amount | 5,000,000 |
| Manager Name | 김영업 |

**항목 예시**:
| 품명 | 수량 | 단가 | 금액 |
|------|------|------|------|
| 아스팔트 포장 | 100 | 50,000 | 5,000,000 |

---

## ✅ 검증 체크리스트

- [ ] Invoices 데이터베이스 생성 완료
- [ ] InvoiceItems 데이터베이스 생성 완료
- [ ] 모든 필수 속성 추가 완료
- [ ] Relation 설정 완료 (양방향)
- [ ] Rollup & Formula 설정 완료
- [ ] Notion Integration 생성 완료
- [ ] API 키 발급 및 저장 완료
- [ ] 양 데이터베이스에 Integration 공유 완료
- [ ] 샘플 데이터 입력 완료
- [ ] `.env.local`에 API 키 및 DATABASE ID 저장 완료

---

## 🔧 향후 확장

### 추가 가능한 속성

- **Tags**: 견적서 카테고리/태그
- **Attachment**: 관련 문서 파일 첨부
- **Checkbox**: 승인 여부 추적
- **People**: 승인자 지정
- **Collaborators**: 협업자 추가

### 추가 데이터베이스 (향후)

- **Customers**: 고객사 마스터 정보
- **Users**: 영업팀 사용자 관리
- **Templates**: 견적서 템플릿

---

## 📚 참고 자료

- [Notion API 공식 문서](https://developers.notion.com)
- [Notion Database 속성 타입](https://www.notion.so/help/database-properties)
- [Relations and Rollups](https://www.notion.so/help/relations-and-rollups)
