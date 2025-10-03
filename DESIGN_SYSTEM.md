# 디자인 시스템 적용 가이드

이 문서는 admin-page 프로젝트에 적용된 디자인 시스템에 대한 가이드입니다.

## 📋 개요

디자인 시스템은 `design-tokens.json` 파일을 기반으로 구축되었으며, 일관된 사용자 경험을 제공하기 위해 모든 컴포넌트와 페이지에 적용되었습니다.

## 🎨 디자인 토큰 구조

### 1. Atomic Colors (원자 색상)

- **Blue**: 주요 브랜드 색상 (#070913 ~ #e3e7f5)
- **Green**: 성공 상태 (#00230b ~ #d9ffe6)
- **Neutral**: 중성 색상 (#0f0f10 ~ #f7f7f8)
- **Orange**: 경고 상태 (#361e00 ~ #fef4e6)
- **Purple**: 보조 색상 (#0d002f ~ #f0eaff)
- **Red**: 오류 상태 (#3a0000 ~ #fffafa)
- **Warm Neutral**: 따뜻한 중성 색상 (#09090c ~ #f7f7f8)
- **Common**: 기본 색상 (검정, 흰색)

### 2. Semantic Colors (의미론적 색상)

- **Background**: 배경 색상
- **Fill**: 채움 색상
- **Inverse**: 반전 색상
- **Label**: 텍스트 색상
- **Line**: 선 색상
- **Material**: 재질 색상
- **Primary**: 주요 색상
- **Secondary**: 보조 색상
- **Static**: 정적 색상
- **Status**: 상태 색상 (성공, 경고, 오류)

### 3. Typography (타이포그래피)

- **Display**: 대형 표시 텍스트 (56px, 40px)
- **Title**: 제목 텍스트 (36px, 28px, 24px)
- **Heading**: 섹션 제목 (22px, 20px)
- **Headline**: 강조 텍스트 (18px, 17px)
- **Body**: 본문 텍스트 (16px, 15px)
- **Label**: 라벨 텍스트 (14px, 13px)
- **Caption**: 캡션 텍스트 (12px, 11px)

## 🛠 구현된 컴포넌트

### 1. Typography 컴포넌트

```tsx
import { Typography, Title1, Body1, Label1 } from "@/components/ui/typography";

// 기본 사용법
<Typography level="title-1" weight="bold" color="primary">
  제목 텍스트
</Typography>

// 편의 컴포넌트
<Title1>제목</Title1>
<Body1>본문 텍스트</Body1>
<Label1 color="muted">라벨</Label1>
```

### 2. 업데이트된 UI 컴포넌트들

- **Button**: 디자인 토큰 기반 색상 및 타이포그래피 적용
- **Card**: 일관된 보더 및 배경 색상 적용
- **Input**: 디자인 시스템 기반 스타일링
- **Header**: 타이포그래피 시스템 적용
- **Sidebar**: 색상 토큰 기반 스타일링

## 🎯 사용 가이드

### 1. 색상 사용

```tsx
// ✅ 권장: Semantic 색상 사용
<div className="bg-primary text-primary-foreground">
<div className="text-destructive">
<div className="border-border">

// ❌ 비권장: Atomic 색상 직접 사용
<div className="bg-atomic-blue-800">
```

### 2. 타이포그래피 사용

```tsx
// ✅ 권장: Typography 컴포넌트 사용
<Title1>페이지 제목</Title1>
<Body1>본문 내용</Body1>

// ✅ 권장: CSS 클래스 사용
<h1 className="text-title-1 font-bold">
<p className="text-body-1">
<span className="text-label-1 text-muted">
```

### 3. 반응형 디자인

```tsx
// 화면 크기별 타이포그래피
<h1 className="text-title-2 sm:text-title-1">
<p className="text-body-2 sm:text-body-1">
```

## 📁 파일 구조

```
├── lib/
│   └── design-tokens.ts          # 디자인 토큰 정의
├── components/
│   └── ui/
│       ├── typography.tsx        # 타이포그래피 컴포넌트
│       ├── typography.stories.tsx # 타이포그래피 스토리
│       ├── design-tokens.stories.tsx # 색상 토큰 스토리
│       ├── button.tsx            # 업데이트된 버튼 컴포넌트
│       ├── card.tsx              # 업데이트된 카드 컴포넌트
│       └── input.tsx             # 업데이트된 인풋 컴포넌트
├── app/
│   ├── globals.css               # 디자인 토큰 기반 CSS 변수
│   └── components/
│       ├── header.tsx            # 업데이트된 헤더
│       └── sidebar.tsx           # 업데이트된 사이드바
└── tailwind.config.js            # 디자인 토큰 기반 설정
```

## 🚀 Storybook에서 확인

디자인 시스템은 Storybook을 통해 시각적으로 확인할 수 있습니다:

```bash
pnpm storybook
```

다음 스토리들을 확인하세요:

- **Design System/Typography**: 모든 타이포그래피 레벨과 스타일
- **Design System/Design Tokens**: 색상 팔레트와 의미론적 색상
- **UI/Button**: 업데이트된 버튼 컴포넌트

## 🔧 커스터마이징

### 1. 새로운 색상 추가

`lib/design-tokens.ts`에서 색상을 추가하고 `tailwind.config.js`에 매핑하세요.

### 2. 새로운 타이포그래피 레벨 추가

`design-tokens.json`에 새로운 레벨을 추가하고 `typography.tsx`에 컴포넌트를 생성하세요.

### 3. 다크 모드 지원

`app/globals.css`의 `.dark` 클래스에서 다크 모드 색상을 정의하세요.

## 📝 베스트 프랙티스

1. **일관성**: 항상 디자인 토큰을 사용하여 일관된 스타일을 유지하세요.
2. **의미론적 사용**: Atomic 색상보다는 Semantic 색상을 우선 사용하세요.
3. **접근성**: 충분한 대비를 위해 색상 조합을 신중하게 선택하세요.
4. **반응형**: 다양한 화면 크기에서 적절한 타이포그래피를 사용하세요.
5. **성능**: 불필요한 CSS 클래스를 피하고 최적화된 스타일을 사용하세요.

## 🔄 업데이트 가이드

디자인 토큰이 변경될 때마다 다음 단계를 따르세요:

1. `design-tokens.json` 업데이트
2. `lib/design-tokens.ts` 업데이트
3. `tailwind.config.js` 업데이트
4. `app/globals.css` CSS 변수 업데이트
5. Storybook 스토리 업데이트
6. 컴포넌트 테스트 및 검증

이 디자인 시스템을 통해 일관되고 확장 가능한 사용자 인터페이스를 구축할 수 있습니다.
