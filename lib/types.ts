// Core entity types for dormitory management system
export interface Room {
  id: number;
  name: string;
  floor: number;
  capacity: number;
}

export interface Student {
  id: number;
  name: string;
  studentIdNum: string;
  affiliation: string;
  major: string;
  roomId: string;

}

export interface Rollcall {
  id: number;
  date: string;
  roomId: number;
  studentId: number;
  present: boolean;
  status?: "PRESENT" | "LEAVE" | "ABSENT";
  checkedAt?: string;
  checker?: string;
  note?: string;
}

export interface Point {
  id: number;
  studentId: number;
  type: "MERIT" | "DEMERIT";
  score: number;
  reason: string;
  createdAt: string;
}

export interface Parcel {
  id: number;
  courier: string;
  trackingNo?: string;
  studentId: number;
  roomId: number;
  arrivedAt: string;
  pickedUp: boolean;
  pickedUpAt?: string;
  memo?: string;
}

export interface Inquiry {
  id: number;
  studentId: number;
  title: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  content?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  is_important: boolean;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Query parameter types
export interface StudentQuery {
  roomId?: string;
  name?: string;
}

export interface RollcallQuery {
  date?: string;
  roomId?: number;
  name?: string;
  present?: boolean;
}

export interface ParcelQuery {
  carrier?: string;
  pickedUp?: boolean;
  name?: string;
  room?: string;
}

export interface InquiryQuery {
  status?: string;
  category?: string;
  name?: string;
}

export interface NoticeQuery {
  limit?: number;
  page?: number;
}

export interface NoticePageInfo {
  total_page: number;
  total_notice: number;
  now_page: number;
}

export interface NoticePaginatedResponse {
  notices: Notice[];
  page_info: NoticePageInfo;
}
