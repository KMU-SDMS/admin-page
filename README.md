# 기숙사 관리 시스템 (Admin Page)

기숙사 관리자들을 위한 통합 관리 시스템입니다. 택배 관리, 점호 관리, 문의 관리, 공지사항 관리 기능을 제공하는 관리자 전용 웹 애플리케이션입니다.

## 🚀 주요 기능

### 공지사항 관리 시스템

- **공지 CRUD**: 작성·수정·삭제·미리보기까지 단일 화면에서 처리
- **우선순위/기간 필터**: 중요도와 기간별 조회로 빠른 선별
- **미리보기 & 배포 흐름**: 게시 전 최종 검토와 배포 상태 표시

### 학생 관리 시스템

- **학생 프로필 관리**: 세부 정보 열람 및 수정
- **일괄 알림**: 선택 학생에게 즉시 알림 전송
- **호실 배정 뷰**: 모달 기반 호실 이동/배정 관리

### 납부 관리(관리비) 시스템

- **납부 현황 대시보드**: 층·납부 상태별 필터와 페이지네이션
- **사진 업로드/확인**: 납부 영수증 업로드 및 모바일 확인 플로우
- **미납 요청**: 미납 세대에 대한 송금 요청 버튼 제공

### 외박 신청 관리 시스템

- **신청 목록 열람**: 승인 대기·승인·반려 상태별 조회
- **세부 모달**: 학생 상세·신청 내역·처리 이력 확인
- **상태 업데이트**: 승인/반려 처리와 메모 기록

### 인증 및 접근 제어

- **Auth Guard**: 미인증 사용자의 페이지 접근을 로그인으로 리다이렉션
- **세션 동기화**: `auth-sync` 유틸로 탭 간 로그인 상태 유지
- **모바일 전용 UI 보호**: 모바일 하단바에 접근 가드 적용

## 🛠 기술 스택

- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Build Tool**: Next.js (SWC/Turbopack)
- **Styling**: Tailwind CSS with Custom CSS Variables
- **UI Components**: Custom component library with shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, custom hooks)
- **Data Fetching**: Custom hooks with SWR-like pattern
- **Routing**: Next.js App Router (`app/` 디렉터리 기반 파일 라우팅)
- **HTTP Client**: Fetch API (래퍼: `lib/api.ts`)
- **Date Handling**: date-fns
- **Responsive Design**: Custom viewport hooks and CSS clamp()

## 📁 프로젝트 구조 (App Router)

```
admin-page/
├── app/                       # Next.js App Router
│   ├── layout.tsx            # 루트 레이아웃
│   ├── page.tsx              # 대시보드(홈)
│   ├── globals.css           # 전역 스타일 및 반응형 CSS
│   ├── inquiries/            # 문의 관리 라우트
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── inquiries-page-client.tsx
│   ├── notices/              # 공지사항 관리 라우트
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── notices-page-client.tsx
│   ├── packages/             # 택배 관리 라우트
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── packages-page-client.tsx
│   ├── rollcall/             # 점호 관리 라우트
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── rollcall-page-client.tsx
│   └── students/             # 학생 관리 라우트
│       ├── page.tsx
│       ├── loading.tsx
│       └── students-page-client.tsx
│
├── components/               # 재사용 가능한 컴포넌트
│   ├── layout.tsx           # 메인 레이아웃 (모바일 사이드바 포함)
│   ├── header.tsx           # 헤더 (모바일 메뉴 버튼 포함)
│   ├── sidebar.tsx          # 사이드바 (반응형)
│   ├── theme-provider.tsx   # 테마 프로바이더
│   ├── inquiries/           # 문의 관련 컴포넌트
│   ├── notices/             # 공지사항 관련 컴포넌트
│   ├── packages/            # 택배 관련 컴포넌트
│   ├── rollcall/            # 점호 관련 컴포넌트
│   ├── students/            # 학생 관련 컴포넌트
│   └── ui/                  # 기본 UI 컴포넌트 (shadcn/ui 기반)
│
├── hooks/                   # 커스텀 훅들
│   ├── use-viewport.ts      # 반응형 뷰포트 관리
│   ├── use-mobile.ts        # 모바일 감지
│   ├── use-notices.ts       # 공지사항 데이터 관리
│   ├── use-students.ts      # 학생 데이터 관리
│   └── ...                  # 기타 도메인별 훅들
│
├── lib/                     # 유틸리티 및 설정
│   ├── api.ts              # API 클라이언트
│   ├── types.ts            # TypeScript 타입 정의
│   ├── utils.ts            # 유틸리티 함수
│   └── mock-data.ts        # 개발용 목 데이터
│
├── public/                  # 정적 자산
├── styles/                  # 추가 스타일 파일
└── student-management-task.md # 프로젝트 요구사항 문서
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 8.0.0 이상 또는 pnpm

### 설치 및 실행

1. **저장소 클론**

   ```bash
   git clone <repository-url>
   cd admin-page
   ```

2. **의존성 설치**

   ```bash
   pnpm install
   ```

3. **개발 서버 실행**

   ```bash
   pnpm dev
   ```

4. **브라우저에서 확인**
   ```
   http://localhost:8080
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

### 컴포넌트 개발

- **Storybook**: UI 컴포넌트 문서화 및 독립적 개발 환경
  - 포트 6006에서 실행 (`pnpm storybook`)
  - 다크모드/라이트모드 지원
  - 접근성(a11y) 테스트 통합
  - 인터랙티브 컴포넌트 테스트

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

# Storybook 실행
pnpm storybook

# Storybook 빌드
pnpm build-storybook
```

## 🎨 디자인 시스템

### 색상 팔레트 (CSS Variables)

- **Primary**: `oklch(0.205 0 0)` (다크 그레이)
- **Secondary**: `oklch(0.97 0 0)` (라이트 그레이)
- **Background**: `oklch(1 0 0)` (화이트)
- **Foreground**: `oklch(0.145 0 0)` (다크 텍스트)
- **Border**: `oklch(0.922 0 0)` (라이트 보더)
- **Sidebar**: `oklch(0.985 0 0)` (사이드바 배경)

### 반응형 디자인 시스템

- **뷰포트 기반 폰트 크기**: `clamp()` 함수를 활용한 FHD/QHD 자동 조정
- **모바일 우선 설계**: 320px부터 시작하는 반응형 브레이크포인트
- **커스텀 CSS 클래스**: 뷰포트 높이에 따른 간격 및 크기 조정

### 컴포넌트 클래스

```css
/* 반응형 폰트 */
.text-responsive-xs    /* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
/* 15% 크기 감소된 반응형 폰트 */
.text-responsive-base  /* 기본 반응형 폰트 */

/* 뷰포트 기반 간격 */
.spacing-compact       /* 컴팩트 간격 */
.spacing-normal        /* 일반 간격 */
.spacing-loose         /* 넓은 간격 */

/* 테이블 스타일 */
.notice-table-row      /* 공지사항 테이블 행 높이 */
.notice-table-padding; /* 반응형 패딩 */
```

## 📱 반응형 디자인

### 브레이크포인트

- **Mobile**: 320px 이상 (< 768px)
- **Tablet**: 768px 이상 (< 1024px)
- **Desktop**: 1024px 이상 (< 1280px)
- **Large Desktop**: 1280px 이상 (< 1536px)
- **2XL Desktop**: 1536px 이상

### 반응형 기능

- **모바일 사이드바**: 오버레이 방식의 슬라이드 인/아웃
- **뷰포트 기반 폰트**: FHD(16px) ↔ QHD(24px) 자동 조정
- **컴팩트 레이아웃**: 화면 높이에 따른 간격 자동 조정
- **터치 친화적 UI**: 모바일에서 최적화된 버튼 크기

## 🔄 상태 관리

- **React Hooks**: useState, useEffect를 활용한 로컬 상태 관리
- **커스텀 훅**: 도메인별 데이터 관리 (`useNotices`, `useStudents` 등)
- **뷰포트 상태**: `useViewport` 훅을 통한 반응형 상태 관리
- **Context API**: 테마 및 전역 상태 관리

## 🌐 API 연동

API 연동을 위한 구조화된 아키텍처:

- `lib/api.ts`: Fetch 래퍼 및 HTTP 클라이언트
- `lib/types.ts`: TypeScript 타입 정의
- `lib/mock-data.ts`: 개발용 목 데이터
- `hooks/*`: API 호출을 위한 커스텀 훅
- **에러 처리**: 통합된 에러 핸들링 시스템
- **로딩 상태**: 일관된 로딩 UI 패턴

## 📝 개발 가이드라인

### 코드 스타일

- ESLint Next.js 가이드라인 준수
- Prettier를 통한 일관된 코드 포맷팅
- TypeScript strict 모드 사용
- Conventional Commits 규칙 적용

### 컴포넌트 작성

- 함수형 컴포넌트 사용
- TypeScript 인터페이스로 props 타입 정의
- 재사용 가능한 컴포넌트 설계
- Client/Server 컴포넌트 분리 (Next.js App Router)

### 파일 명명 규칙

- 컴포넌트: PascalCase (예: `UserProfile.tsx`)
- 페이지: kebab-case (예: `notices-page-client.tsx`)
- 훅: camelCase with 'use' prefix (예: `useViewport.ts`)
- 유틸리티: camelCase (예: `formatDate.ts`)

### 반응형 개발

- `useViewport` 훅을 활용한 반응형 로직
- CSS `clamp()` 함수를 활용한 반응형 스타일링
- 모바일 우선 설계 원칙

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feat/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feat/amazing-feature`)
5. Pull Request를 생성합니다

### 기여 가이드라인

- **브랜치 명명**: `feat/`, `fix/`, `chore/` 접두사 사용
- **커밋 메시지**: Conventional Commits 규칙 준수
- **코드 리뷰**: 모든 변경사항은 코드 리뷰를 거쳐야 함
- **테스트**: 새로운 기능 추가 시 테스트 코드 작성 권장

## 🧭 Git 워크플로우

### 커밋 규칙 (Conventional Commits)

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `chore`: 빌드/도구/설정 변경 등 코드 영향 없는 작업
- `refactor`: 기능 변경 없이 구조/가독성 개선
- `docs`: 문서 변경 (README 등)
- `test`: 테스트 추가/수정
- `ci`: CI 구성/스크립트 변경
- `perf`: 성능 개선

예시:

```
feat(rollcall): 체크리스트 일괄 출석 처리 기능 추가
fix(api): 학생 조회 시 roomId 필터가 적용되지 않던 문제 수정
docs: README에 설치 가이드 보강
```

### 브랜치 전략

- `main`: 프로덕션 배포 브랜치
- `feat/*`: 기능 개발 브랜치 (예: `feat/notice-components-responsivation`)
- `fix/*`: 버그 수정 브랜치 (예: `fix/notice-table-height`)
- `chore/*`: 설정/빌드/의존성 작업 브랜치 (예: `chore/update-deps`)

권장 흐름:

1. `feat/*` 또는 `fix/*` 에서 작업 → 2) PR 생성 및 리뷰 → 3) `main`으로 머지

### 최근 주요 브랜치

- `feat/notice-components-responsivation`: 공지사항 페이지 반응형 디자인 및 모바일 최적화

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**기숙사 관리 시스템 (Admin Page)** - 효율적인 기숙사 관리를 위한 통합 관리자 솔루션
