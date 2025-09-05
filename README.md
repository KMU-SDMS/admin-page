# 기숙사 관리 시스템

기숙사 관리자들을 위한 통합 관리 시스템입니다. 택배 관리, 점호 관리, 문의 관리, 공지 발송 기능을 제공합니다.

## 🚀 주요 기능

### 1. 택배 관리 시스템
- **실시간 현황 모니터링**: 도착, 수령 대기, 완료 현황을 한눈에 파악
- **OCR 기반 자동 등록**: 송장 정보 자동 입력 (시뮬레이션)
- **수령률 통계**: 효율성 측정을 위한 데이터 분석

### 2. 점호 스마트 시스템
- **층별 현황 관리**: 각 층의 출석률과 완료 상황 실시간 확인
- **디지털 기록**: 수기 작업을 대체하는 효율적인 점호 관리
- **진행 상황 추적**: 점호 진행 과정의 실시간 모니터링

### 3. 문의 관리 시스템
- **실시간 채팅**: 학생들과의 즉시 소통 채널
- **상태별 분류**: 대기, 처리중, 완료 상태로 체계적 관리
- **우선순위 처리**: 긴급도에 따른 효율적 응대

### 4. 공지 발송 시스템
- **타겟팅 발송**: 전체 또는 특정 층 대상 선택적 공지
- **중요도 설정**: 공지의 우선순위 분류
- **발송 이력 관리**: 과거 공지 내역 추적

## 🛠 기술 스택

- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Build Tool**: Next.js (SWC/Turbopack)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: Next.js App Router (`app/` 디렉터리 기반 파일 라우팅)
- **HTTP Client**: Fetch API (래퍼: `lib/api.ts`)
- **Charts**: Recharts
- **Date Handling**: date-fns

## 📁 프로젝트 구조 (App Router)

```
app/
├── layout.tsx                 # 루트 레이아웃
├── page.tsx                   # 대시보드(홈)
├── globals.css                # 전역 스타일(App Router)
├── inquiries/                 # 문의 관리 라우트
│   ├── page.tsx
│   └── loading.tsx
├── notices/                   # 공지 라우트
│   ├── page.tsx
│   └── loading.tsx
├── packages/                  # 택배 관리 라우트
│   ├── page.tsx
│   └── loading.tsx
└── rollcall/                  # 점호 관리 라우트
    ├── page.tsx
    └── loading.tsx

components/
├── layout.tsx                 # 공용 레이아웃 컴포넌트
├── header.tsx
├── sidebar.tsx
├── inquiries/                 # 도메인 컴포넌트
├── notices/
├── packages/
└── rollcall/

hooks/                         # 커스텀 훅들
lib/                           # 유틸리티/타입/API 래퍼
├── api.ts
├── types.ts
└── utils.ts
public/                        # 정적 자산
styles/                        # Tailwind 등 스타일 리소스
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 8.0.0 이상

### 설치 및 실행

1. **의존성 설치**
   ```bash
   pnpm install
   ```

2. **개발 서버 실행**
   ```bash
   pnpm dev
   ```

3. **브라우저에서 확인**
   ```
   http://localhost:3000
   ```

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 시작
pnpm start
```

## 🔧 개발 도구

### 코드 품질

- **ESLint**: Next.js ESLint 설정 기반
- **Prettier**: 코드 포맷팅 자동화
- **TypeScript**: 타입 안정성 보장

### 사용 가능한 스크립트

```bash
# 개발 서버 실행
pnpm dev

# 린트 검사
pnpm lint

# 프로덕션 빌드
pnpm build

# 서버 시작
pnpm start
```

## 🎨 디자인 시스템

### 색상 팔레트

- **Primary**: 파란색 계열 (#3b82f6)
- **Secondary**: 회색 계열 (#64748b)
- **Success**: 초록색 (#10b981)
- **Warning**: 노란색 (#f59e0b)
- **Error**: 빨간색 (#ef4444)

### 컴포넌트 클래스

```css
/* 버튼 */
.btn-primary    /* 주요 액션 버튼 */
.btn-secondary  /* 보조 액션 버튼 */

/* 카드 */
.card          /* 기본 카드 컨테이너 */

/* 입력 */
.input         /* 텍스트 입력 필드 */
.label         /* 폼 라벨 */
```

## 📱 반응형 디자인

- **Mobile**: 320px 이상
- **Tablet**: 768px 이상
- **Desktop**: 1024px 이상
- **Large Desktop**: 1280px 이상

## 🔄 상태 관리

현재는 React의 기본 상태 관리를 사용하고 있으며, 필요에 따라 Context API나 외부 상태 관리 라이브러리 도입을 고려할 수 있습니다.

## 🌐 API 연동

API 연동을 위한 기본 구조가 준비되어 있습니다:

- `lib/api.ts`: Fetch 래퍼 및 헬퍼
- `lib/types.ts`: API/도메인 타입 정의
- `hooks/*`: API 호출을 위한 커스텀 훅

## 📝 개발 가이드라인

### 코드 스타일

- ESLint Google Style 가이드라인 준수
- Prettier를 통한 일관된 코드 포맷팅
- TypeScript strict 모드 사용

### 컴포넌트 작성

- 함수형 컴포넌트 사용
- TypeScript 인터페이스로 props 타입 정의
- 재사용 가능한 컴포넌트 설계

### 파일 명명 규칙

- 컴포넌트: PascalCase (예: `UserProfile.tsx`)
- 훅: camelCase with 'use' prefix (예: `useUserData.ts`)
- 유틸리티: camelCase (예: `formatDate.ts`)

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**기숙사 관리 시스템** - 효율적인 기숙사 관리를 위한 통합 솔루션
