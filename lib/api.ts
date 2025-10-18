import type {
  Notice,
  NoticePaginatedResponse,
  NoticeQuery,
  Student,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // 절대 URL이면 그대로 사용, 그 외는 API_BASE와 결합 (Next에는 API 라우트 없음)
  const isAbsoluteUrl = /^https?:\/\//.test(path);
  const normalizedPath = isAbsoluteUrl
    ? path
    : path.startsWith("/")
    ? path
    : `/${path}`;
  const url = isAbsoluteUrl ? normalizedPath : `${API_BASE}${normalizedPath}`;

  try {
    // 바디 유형에 따라 Content-Type 자동 설정
    // - FormData/URLSearchParams/Blob 등은 브라우저가 설정하도록 그대로 둔다 (preflight 회피)
    // - 그 외(문자열/순수 객체)는 application/json 지정
    const mergedHeaders: HeadersInit = { ...(init?.headers ?? {}) };
    const bodyValue: any = init?.body as any;
    const hasBody = bodyValue !== undefined && bodyValue !== null;
    const isFormData = typeof FormData !== "undefined" && hasBody && bodyValue instanceof FormData;
    const isUrlEncoded = typeof URLSearchParams !== "undefined" && hasBody && bodyValue instanceof URLSearchParams;
    const isBlob = typeof Blob !== "undefined" && hasBody && bodyValue instanceof Blob;
    const isArrayBuffer = typeof ArrayBuffer !== "undefined" && hasBody && bodyValue instanceof ArrayBuffer;
    const isReadable = typeof ReadableStream !== "undefined" && hasBody && bodyValue instanceof ReadableStream;
    const isJsonCandidate = hasBody && !isFormData && !isUrlEncoded && !isBlob && !isArrayBuffer && !isReadable;
    if (isJsonCandidate && !(mergedHeaders as Record<string, string>)["Content-Type"]) {
      (mergedHeaders as Record<string, string>)["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      credentials: "include", // 쿠키를 통한 세션 인증
      headers: mergedHeaders,
      ...init,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`
      );
    }

    // JSON 이외 혹은 빈 응답(204)도 안전하게 처리
    const contentType = response.headers.get("content-type") || "";
    if (response.status === 204 || contentType === "") {
      return undefined as unknown as T;
    }
    if (contentType.includes("application/json")) {
      try {
        const data = await response.json();
        return data as T;
      } catch {
        const text = await response.text();
        return text as unknown as T;
      }
    }
    const text = await response.text();
    return text as unknown as T;
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
  getAll: () => apiGet<Notice[]>("/api/notices"),
  getPaginated: (params?: NoticeQuery) =>
    apiGet<NoticePaginatedResponse>("/api/notices", params),
  getById: (id: number) => apiGet<Notice>(`/api/notices/${id}`),
  create: (data: { title: string; content: string; is_important: boolean }) =>
    request<Notice>("/api/notice", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (data: {
    id: number;
    title: string;
    content: string;
    is_important: boolean;
  }) =>
    request<Notice>("/api/notice", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => {
    return request<{ message: string }>("/api/notice", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
  },
};

// Students API
export const studentsApi = {
  getAll: () => {
    return apiGet<Student[]>("/api/students");
  },
  getById: (id: number) => apiGet<Student>(`/api/students/${id}`),
  create: (data: {
    name: string;
    studentIdNum: string;
    roomNumber: number;
    checkInDate: string;
  }) => apiPost<Student>("/api/student", data),
  update: (data: {
    studentIdNum: string;
    name: string;
    roomNumber: number;
    checkInDate: string;
  }) =>
    request<Student>("/api/student", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (studentIdNum: string) =>
    apiDelete<{ message: string }>(`/api/student?studentIdNum=${studentIdNum}`),
};

// Rooms API
export const roomsApi = {
  getAll: () => apiGet<any[]>("/api/rooms"),
  getById: (id: number) => apiGet<any>(`/api/rooms/${id}`),
};

// Inquiries API
export const inquiriesApi = {
  getAll: () => apiGet<any[]>("/api/inquiries"),
  getById: (id: number) => apiGet<any>(`/api/inquiries/${id}`),
};

// Parcels API
export const parcelsApi = {
  getAll: () => apiGet<any[]>("/api/parcels"),
  getById: (id: number) => apiGet<any>(`/api/parcels/${id}`),
};

// Rollcalls API
export const rollcallsApi = {
  getAll: () => apiGet<any[]>("/api/rollcalls"),
  getById: (id: number) => apiGet<any>(`/api/rollcalls/${id}`),
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
