// Core entity types for dormitory management system
export interface Room {
  id: number
  name: string
  floor: number
  capacity: number
}

export interface Student {
  id: number
  name: string
  studentNo: string
  roomId: number
  status: "IN" | "OUT" | "LEAVE"
}

export interface Rollcall {
  id: number
  date: string
  roomId: number
  studentId: number
  present: boolean
  status?: "PRESENT" | "LEAVE" | "ABSENT"
  checkedAt?: string
  checker?: string
  note?: string
}

export interface Point {
  id: number
  studentId: number
  type: "MERIT" | "DEMERIT"
  score: number
  reason: string
  createdAt: string
}

export interface Parcel {
  id: number
  courier: string
  trackingNo?: string
  studentId: number
  roomId: number
  arrivedAt: string
  pickedUp: boolean
  pickedUpAt?: string
  memo?: string
}

export interface Inquiry {
  id: number
  studentId: number
  title: string
  category: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  content?: string
  createdAt: string
  updatedAt?: string
}

export interface Notice {
  id: number
  title: string
  body: string
  target: "ALL" | "FLOOR" | "ROOM"
  floor?: number
  roomId?: number
  createdAt: string
}

// API response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

// Query parameter types
export interface StudentQuery {
  roomId?: number
  name?: string
}

export interface RollcallQuery {
  date?: string
  roomId?: number
  name?: string
  present?: boolean
}

export interface ParcelQuery {
  carrier?: string
  pickedUp?: boolean
  name?: string
  room?: string
}

export interface InquiryQuery {
  status?: string
  category?: string
  name?: string
}

export interface NoticeQuery {
  limit?: number
}
