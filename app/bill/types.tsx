// 공통 타입 정의
export interface Room {
  floor: number;
  roomNumber: string;
  hasPhotos: boolean;
}

export interface Photo {
  id: string;
  type: '수도' | '전기' | '가스';
  url: string;
  roomNumber: string;
  timestamp: Date;
  mimeType?: string; // 파일의 MIME 타입 저장
}

// 서버에서 받아오는 사진 정보
export interface ServerPhotoResponse {
  key: string;
  url: string;
  lastModified: string;
  size: number;
}

// 서버에서 받아오는 호실 정보
export interface ApiRoom {
  id: number;
  floor: number;
  headcount: number;
}

export type ViewMode = 'list' | 'capture' | 'review';

// 네비게이션 콜백 타입
export interface NavigationCallbacks {
  onNavigateToCapture: (roomNumber: string) => void;
  onNavigateToReview: (roomNumber: string) => void;
  onBack: () => void;
}

// 공통 Props 타입
export interface CommonProps {
  selectedRoom: string | null;
  selectedYear: number;
  selectedMonth: number;
  onRoomChange: (roomNumber: string | null) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}