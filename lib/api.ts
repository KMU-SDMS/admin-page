import type {
  Notice,
  NoticePaginatedResponse,
  NoticeQuery,
  Student,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/";

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      ...init,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

function apiGet<T>(path: string, params?: Record<string, any>) {
  const queryString = params ? buildQueryString(params) : "";
  return request<T>(`${path}${queryString}`);
}

function apiPost<T>(path: string, data?: any) {
  return request<T>(path, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

function apiPatch<T>(path: string, data?: any) {
  return request<T>(path, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
}

function apiDelete<T>(path: string) {
  return request<T>(path, { method: "DELETE" });
}

// Notices API
export const noticesApi = {
  getAll: () => apiGet<Notice[]>("/notices"),
  getPaginated: (params?: NoticeQuery) =>
    apiGet<NoticePaginatedResponse>("/notices", params),
  getById: (id: number) => apiGet<Notice>(`/notices/${id}`),
  create: (data: { title: string; content: string; is_important: boolean }) =>
    apiPost<Notice>("/notice", data),
  update: (data: {
    id: number;
    title: string;
    content: string;
    is_important: boolean;
  }) =>
    request<Notice>("/notice", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => {
    return request<{ message: string }>("/notice", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
  },
};

// Students API
export const studentsApi = {
  getAll: () => {
    return apiGet<Student[]>("/students");
  },
  getById: (id: number) => apiGet<Student>(`/students/${id}`),
};

// Rooms API
export const roomsApi = {
  getAll: () => apiGet<any[]>("/rooms"),
  getById: (id: number) => apiGet<any>(`/rooms/${id}`),
};

// Inquiries API
export const inquiriesApi = {
  getAll: () => apiGet<any[]>("/inquiries"),
  getById: (id: number) => apiGet<any>(`/inquiries/${id}`),
};

// Parcels API
export const parcelsApi = {
  getAll: () => apiGet<any[]>("/parcels"),
  getById: (id: number) => apiGet<any>(`/parcels/${id}`),
};

// Rollcalls API
export const rollcallsApi = {
  getAll: () => apiGet<any[]>("/rollcalls"),
  getById: (id: number) => apiGet<any>(`/rollcalls/${id}`),
};

export const api = {
  get: apiGet,
  post: apiPost,
  patch: apiPatch,
  delete: apiDelete,
  notices: noticesApi,
  students: studentsApi,
  rooms: roomsApi,
  inquiries: inquiriesApi,
  parcels: parcelsApi,
  rollcalls: rollcallsApi,
};
