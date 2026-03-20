# Invoice Web

노션 데이터베이스에서 관리되는 견적서를 클라이언트가 웹으로 편하게 확인하고 PDF로 다운로드할 수 있는 웹 애플리케이션입니다.

## 🎯 프로젝트 개요

**목적**: 노션 견적서 → 웹 조회 + PDF 다운로드

**사용자**: 영업팀(발송), 고객사(확인)

## 📱 주요 기능

- 견적서 목록 조회 (노션 실시간 동기화)
- 견적서 상세 조회
- PDF 다운로드
- 사용자 인증 (로그인/회원가입)

## 🛠️ 기술 스택

- **Framework**: Next.js 15.5.3 (App Router)
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5
- **Styling**: TailwindCSS v4 + shadcn/ui
- **Forms**: React Hook Form + Zod
- **API**: Notion API (@notionhq/client)

## 🚀 시작하기

```bash
npm install
npm run dev
```

http://localhost:3000 을 브라우저에서 열어 확인하세요.

## 📖 문서

- [PRD](./docs/PRD.md) - 상세 요구사항
- [개발 지침](./CLAUDE.md) - 개발 가이드
