# 학생 관리 탭 구현 To Do List

## 📋 기본 기능 구현

### 1. 페이지 및 라우팅 설정

- [x] `app/students/page.tsx` 생성
- [x] `app/students/loading.tsx` 생성
- [x] 사이드바에 학생 관리 메뉴 추가

### 2. 학생 목록 표시

- [x] 학생 목록 테이블 컴포넌트 생성
- [ ] 학생 검색 기능 구현
- [ ] 호실별 필터링 기능 구현
- [ ] 상태별 필터링 기능 구현 (IN/OUT/LEAVE)
- [ ] 페이지네이션 구현

### 3. 학생 추가 기능

- [ ] 학생 추가 모달 컴포넌트 생성
- [ ] 학생 정보 입력 폼 구현
  - [ ] 이름 입력 필드
  - [ ] 학번 입력 필드 (유효성 검사)
  - [ ] 호실 선택 드롭다운
  - [ ] 상태 선택 (IN/OUT/LEAVE)
- [ ] 중복 학번 검증 로직
- [ ] 호실 정원 확인 로직
- [ ] API 연동 (추가 요청)

### 4. 학생 삭제 기능

- [ ] 삭제 확인 다이얼로그 구현
- [ ] 개별 삭제 기능
- [ ] 다중 선택 삭제 기능
- [ ] 관련 데이터 정리 로직 (점호, 상벌점, 문의사항 등)
- [ ] API 연동 (삭제 요청)

### 5. 학생 정보 수정 기능

- [ ] 학생 정보 수정 모달 컴포넌트 생성
- [ ] 기존 정보 불러오기
- [ ] 정보 수정 폼 구현
- [ ] 호실 변경 시 정원 확인
- [ ] API 연동 (수정 요청)

## 🔧 세부 구현 관계

### 컴포넌트 구조

```
app/students/
├── page.tsx (메인 페이지)
├── loading.tsx (로딩 컴포넌트)
└── components/
    ├── student-list-table.tsx (학생 목록 테이블)
    ├── student-add-modal.tsx (학생 추가 모달)
    ├── student-edit-modal.tsx (학생 수정 모달)
    ├── student-delete-dialog.tsx (삭제 확인 다이얼로그)
    ├── student-search-filters.tsx (검색 및 필터)
    └── student-bulk-actions.tsx (다중 선택 액션)
```

### API 엔드포인트 확장

```typescript
// lib/api.ts에 추가할 엔드포인트
POST /api/students - 학생 추가
PUT /api/students/:id - 학생 정보 수정
DELETE /api/students/:id - 학생 삭제
DELETE /api/students/bulk - 다중 학생 삭제
```

### Hook 확장

```typescript
// hooks/use-students.ts에 추가할 기능
- addStudent(student: Omit<Student, 'id'>) => Promise<void>
- updateStudent(id: number, student: Partial<Student>) => Promise<void>
- deleteStudent(id: number) => Promise<void>
- deleteStudents(ids: number[]) => Promise<void>
- validateStudentNo(studentNo: string) => boolean
- checkRoomCapacity(roomId: number) => { current: number, capacity: number }
```

### 상태 관리

```typescript
// 각 컴포넌트에서 관리할 상태
- 선택된 학생들 (다중 선택)
- 검색어 및 필터 상태
- 모달 열림/닫힘 상태
- 로딩 상태
- 에러 상태
```

### 유효성 검사 규칙

- 학번: 8자리 숫자, 중복 불가
- 이름: 2자 이상, 한글만
- 호실: 기존 호실 중 선택, 정원 확인
- 상태: default IN

### UI/UX 고려사항

- 반응형 디자인 (모바일 대응)
- 접근성 (키보드 네비게이션, 스크린 리더)
- 로딩 상태 표시
- 에러 처리 및 사용자 피드백
- 성능 최적화 (가상화, 메모이제이션)

### 테스트 케이스

- [ ] 학생 추가 성공 케이스
- [ ] 중복 학번 에러 케이스
- [ ] 호실 정원 초과 에러 케이스
- [ ] 학생 삭제 성공 케이스
- [ ] 다중 삭제 성공 케이스
- [ ] 검색 및 필터링 테스트
- [ ] 반응형 레이아웃 테스트
