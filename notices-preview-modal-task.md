# 게시 전 미리보기 강화 기능명세서

## 개요

공지사항 작성 시 실제 카드 형태로 미리보기를 제공하는 모달/새창 프리뷰 기능을 구현합니다. 제목/본문/대상/작성자/게시 시각을 실제 카드 형태로 확인할 수 있도록 강화합니다.

## 기능 요구사항

### 1단계: 기본 미리보기 모달 컴포넌트 생성

- [x] `NoticePreviewModal` 컴포넌트 생성
- [x] 모달 열기/닫기 상태 관리
- [x] 기본 모달 레이아웃 구성
- [x] 모달 헤더 (제목, 닫기 버튼) 구현

### 2단계: 미리보기 카드 디자인 구현

- [ ] 실제 공지사항 카드와 동일한 디자인 적용
- [ ] 제목, 본문, 대상, 작성자, 게시 시각 표시
- [ ] 대상별 배지 스타일링 (전체/층/호실)
- [ ] 반응형 디자인 적용

### 3단계: 미리보기 버튼 강화

- [ ] 기존 미리보기 버튼을 눈에 띄는 스타일로 변경
- [ ] 모달 열기 기능 연결
- [ ] 버튼 상태 관리 (활성화/비활성화)
- [ ] 아이콘 및 텍스트 개선

### 4단계: 모달 내부 기능 구현

- [ ] 실시간 미리보기 업데이트
- [ ] 스크롤 가능한 본문 영역
- [ ] 모달 크기 조절 기능
- [ ] 모바일 반응형 대응

### 5단계: 새창 미리보기 옵션 추가

- [ ] 새창으로 미리보기 열기 버튼 추가
- [ ] 새창에서의 독립적인 미리보기
- [ ] 새창 크기 및 위치 최적화
- [ ] 새창 닫기 시 원래 창으로 포커스

### 6단계: 사용자 경험 개선

- [ ] 로딩 상태 표시
- [ ] 에러 처리
- [ ] 키보드 접근성 (ESC로 닫기)
- [ ] 애니메이션 효과 추가

### 7단계: 통합 및 테스트

- [ ] 기존 공지 작성 폼과 통합
- [ ] 모든 기능 테스트
- [ ] 성능 최적화
- [ ] 접근성 검증

## 구현 상세 방법

### 1. NoticePreviewModal 컴포넌트 구조

```typescript
interface NoticePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  noticeData: {
    title: string;
    body: string;
    target: "ALL" | "FLOOR" | "ROOM";
    floor?: number;
    roomId?: number;
  };
  rooms: Room[];
  onOpenInNewWindow?: () => void;
}
```

### 2. 모달 컴포넌트 구현

```typescript
// components/notices/notice-preview-modal.tsx
export function NoticePreviewModal({
  isOpen,
  onClose,
  noticeData,
  rooms,
  onOpenInNewWindow,
}: NoticePreviewModalProps) {
  // 모달 상태 관리
  // 카드 렌더링 로직
  // 새창 열기 기능
}
```

### 3. 기존 페이지 수정

```typescript
// app/notices/page.tsx 수정사항
const [showModal, setShowModal] = useState(false);

// 미리보기 버튼 클릭 핸들러
const handlePreviewClick = () => {
  setShowModal(true);
};

// 새창 미리보기 핸들러
const handleOpenInNewWindow = () => {
  const newWindow = window.open("", "_blank", "width=800,height=600");
  // 새창에 미리보기 렌더링
};
```

### 4. 스타일링 가이드

```css
/* 미리보기 모달 스타일 */
.preview-modal {
  /* 모달 오버레이 */
  /* 카드 스타일링 */
  /* 반응형 디자인 */
}

/* 새창 미리보기 스타일 */
.new-window-preview {
  /* 독립적인 스타일 */
  /* 인쇄 최적화 */
}
```

### 5. 상태 관리

```typescript
// 미리보기 관련 상태
const [previewState, setPreviewState] = useState({
  isModalOpen: false,
  isNewWindowOpen: false,
  previewData: null,
});
```

### 6. 이벤트 핸들러

```typescript
// 모달 관련 이벤트
const handleModalClose = () =>
  setPreviewState((prev) => ({
    ...prev,
    isModalOpen: false,
  }));

// 새창 관련 이벤트
const handleNewWindowOpen = () => {
  // 새창 열기 로직
};

const handleNewWindowClose = () => {
  // 새창 닫기 로직
};
```

### 7. 접근성 구현

```typescript
// 키보드 이벤트 처리
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      onClose();
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [isOpen, onClose]);
```

### 8. 성능 최적화

```typescript
// 메모이제이션 적용
const MemoizedNoticePreview = memo(NoticePreview);

// 지연 로딩
const LazyPreviewModal = lazy(() => import("./notice-preview-modal"));
```

### 9. 테스트 케이스

```typescript
// 단위 테스트
describe("NoticePreviewModal", () => {
  it("should render notice data correctly");
  it("should handle modal close");
  it("should open in new window");
  it("should be accessible via keyboard");
});

// 통합 테스트
describe("Notice Preview Integration", () => {
  it("should integrate with notice form");
  it("should update preview in real-time");
});
```

### 10. 배포 체크리스트

- [ ] 모든 기능이 정상 작동하는지 확인
- [ ] 모바일 환경에서 테스트
- [ ] 다양한 브라우저에서 테스트
- [ ] 접근성 가이드라인 준수 확인
- [ ] 성능 최적화 완료
- [ ] 에러 처리 완료
- [ ] 사용자 피드백 반영

## 완료 기준

1. **기능적 요구사항**

   - 모달로 미리보기 가능
   - 새창으로 미리보기 가능
   - 실시간 미리보기 업데이트
   - 모든 공지사항 필드 표시

2. **사용자 경험 요구사항**

   - 직관적인 UI/UX
   - 빠른 응답 속도
   - 모바일 친화적
   - 접근성 준수

3. **기술적 요구사항**
   - 타입 안전성
   - 성능 최적화
   - 에러 처리
   - 테스트 커버리지

이 기능명세서를 따라 단계별로 구현하면 완전한 게시 전 미리보기 강화 기능을 구현할 수 있습니다.
