# Storybook 설정 가이드

이 프로젝트의 Storybook 설정 및 사용법을 안내합니다.

## 🚀 실행 방법

```bash
# 개발 모드로 Storybook 실행
pnpm storybook

# 정적 빌드 (배포용)
pnpm build-storybook
```

Storybook은 기본적으로 `http://localhost:6006`에서 실행됩니다.

## 📁 프로젝트 구조

```
.storybook/
├── main.ts          # Storybook 메인 설정
├── preview.tsx      # 전역 데코레이터 및 파라미터
└── vitest.setup.ts  # Vitest 설정 (테스트용)

stories/             # 예제 스토리들
components/          # 실제 프로젝트 컴포넌트 스토리
└── ui/
    ├── button.stories.tsx
    └── card.stories.tsx
```

## 🎨 주요 기능

### 1. 테마 지원

- **라이트/다크 모드**: ThemeProvider를 통한 자동 테마 전환
- **시스템 테마 감지**: 운영체제 설정에 따른 자동 테마 적용

### 2. 애드온

- **@storybook/addon-docs**: 자동 문서 생성
- **@storybook/addon-a11y**: 접근성 테스트
- **@storybook/addon-vitest**: Vitest 통합 테스트
- **@chromatic-com/storybook**: 비주얼 리그레션 테스트

### 3. Next.js 통합

- **@storybook/nextjs-vite**: Next.js 14 App Router와 완벽 통합
- **자동 경로 처리**: Next.js의 `@/` import alias 지원
- **CSS 모듈**: Tailwind CSS 및 globals.css 자동 로드

## 📝 스토리 작성 방법

### 기본 스토리 구조

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { YourComponent } from "./your-component";

const meta = {
  title: "Category/YourComponent",
  component: YourComponent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "secondary"],
      description: "컴포넌트 변형",
    },
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "예제",
  },
};
```

### 스토리 파일 위치

스토리 파일은 다음 위치에서 자동으로 감지됩니다:

- `stories/**/*.stories.@(js|jsx|ts|tsx)`
- `components/**/*.stories.@(js|jsx|ts|tsx)`
- `app/**/*.stories.@(js|jsx|ts|tsx)`

### 예제 스토리

#### Button 컴포넌트

```typescript
export const Variants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="default">Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};
```

#### Card 컴포넌트

```typescript
export const Complete: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>제목</CardTitle>
        <CardDescription>설명</CardDescription>
      </CardHeader>
      <CardContent>내용</CardContent>
      <CardFooter>
        <Button>확인</Button>
      </CardFooter>
    </Card>
  ),
};
```

## 🎯 베스트 프랙티스

### 1. 스토리 구성

- **Default**: 가장 기본적인 사용 예시
- **Variants**: 모든 변형을 한눈에 보여주는 스토리
- **States**: 다양한 상태(비활성화, 로딩 등)
- **Interactive**: 인터랙션이 필요한 복잡한 예시

### 2. ArgTypes 활용

- 모든 주요 props에 대한 설명 추가
- `control` 타입 명시 (select, boolean, text 등)
- 기본값 설정으로 사용자 편의성 향상

### 3. 접근성 테스트

- a11y 애드온 활용하여 접근성 이슈 확인
- ARIA 속성 올바른 사용 검증
- 키보드 네비게이션 테스트

### 4. 반응형 테스트

- Viewport 애드온으로 다양한 화면 크기 테스트
- 모바일/태블릿/데스크탑 각각 확인
- 브레이크포인트별 레이아웃 검증

## 🔧 커스터마이징

### 글로벌 데코레이터 추가

`.storybook/preview.tsx`에서 전역 데코레이터를 추가할 수 있습니다:

```typescript
const withProvider: Decorator = (Story) => (
  <YourProvider>
    <Story />
  </YourProvider>
);

export const decorators = [withProvider];
```

### 파라미터 설정

```typescript
export const parameters = {
  layout: "centered", // centered, fullscreen, padded
  backgrounds: {
    default: "light",
    values: [
      { name: "light", value: "#ffffff" },
      { name: "dark", value: "#000000" },
    ],
  },
};
```

## 🐛 트러블슈팅

### 스타일이 적용되지 않음

- `preview.tsx`에서 `globals.css` import 확인
- Tailwind config가 올바른지 확인

### 컴포넌트를 찾을 수 없음

- `main.ts`의 `stories` 경로 패턴 확인
- 스토리 파일명이 `*.stories.tsx` 형식인지 확인

### 타입 에러

- `@storybook/react` 타입 정의 설치 확인
- TypeScript 버전 호환성 확인

## 📚 참고 자료

- [Storybook 공식 문서](https://storybook.js.org/)
- [Next.js + Storybook 가이드](https://storybook.js.org/docs/get-started/nextjs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com/)
