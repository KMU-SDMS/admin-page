import type {
  Notice,
  NoticePaginatedResponse,
  NoticeQuery,
  Student,
} from "./types";
import { toast } from "sonner";
import { authSync } from "./auth-sync";
import { clearSessionState, markSessionAsActive } from "./auth-bootstrap";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

interface RequestOptions extends RequestInit {
  skipAuthErrorHandling?: boolean;
}

export async function request<T>(
  path: string,
  init?: RequestOptions
): Promise<T> {
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
    const isFormData =
      typeof FormData !== "undefined" &&
      hasBody &&
      bodyValue instanceof FormData;
    const isUrlEncoded =
      typeof URLSearchParams !== "undefined" &&
      hasBody &&
      bodyValue instanceof URLSearchParams;
    const isBlob =
      typeof Blob !== "undefined" && hasBody && bodyValue instanceof Blob;
    const isArrayBuffer =
      typeof ArrayBuffer !== "undefined" &&
      hasBody &&
      bodyValue instanceof ArrayBuffer;
    const isReadable =
      typeof ReadableStream !== "undefined" &&
      hasBody &&
      bodyValue instanceof ReadableStream;
    const isJsonCandidate =
      hasBody &&
      !isFormData &&
      !isUrlEncoded &&
      !isBlob &&
      !isArrayBuffer &&
      !isReadable;
    if (
      isJsonCandidate &&
      !(mergedHeaders as Record<string, string>)["Content-Type"]
    ) {
      (mergedHeaders as Record<string, string>)["Content-Type"] =
        "application/json";
    }

    const response = await fetch(url, {
      credentials: "include", // 쿠키를 통한 세션 인증
      headers: mergedHeaders,
      ...init,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");

      // 401 에러 처리: 세션 만료 또는 인증 실패
      if (response.status === 401 && !init?.skipAuthErrorHandling) {
        // 세션 상태 제거
        clearSessionState();

        // 로그인 페이지나 콜백 페이지가 아닌 경우에만 리다이렉트
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/auth")
        ) {
          // 다른 탭에 로그아웃 알림
          authSync.notifyLogout();

          toast.error("세션이 만료되었습니다. 다시 로그인해주세요.", {
            duration: 3000,
            onAutoClose: () => {
              window.location.href = "/auth";
            },
            onDismiss: () => {
              window.location.href = "/auth";
            },
          });
        }
      }

      throw new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`
      );
    }

    // API 호출 성공 - localStorage에 세션 상태 저장 (Pure Optimistic)
    // skipAuthErrorHandling이 아닌 경우에만 (일반 API 호출)
    if (!init?.skipAuthErrorHandling && typeof window !== "undefined") {
      markSessionAsActive();
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

// Auth API
export const authApi = {
  /**
   * 현재 세션 상태 확인
   * localStorage를 확인하여 세션 존재 여부를 판단 (Cross-Origin 환경)
   */
  checkSession: async (): Promise<{
    authenticated: boolean;
    user?: unknown;
  }> => {
    try {
      // Cross-Origin 환경에서는 쿠키를 JavaScript로 읽을 수 없으므로
      // localStorage를 세션 마커로 사용
      const hasSession = localStorage.getItem("auth_has_session") === "true";

      if (!hasSession) {
        return { authenticated: false };
      }

      // localStorage에 세션 상태가 있으면 인증된 것으로 간주
      // 실제 API 호출 시 401 발생하면 전역 핸들러가 처리
      return { authenticated: true };
    } catch {
      // 에러는 인증되지 않은 것으로 처리
      return { authenticated: false };
    }
  },

  /**
   * 로그인 페이지로 리다이렉트
   * @param redirectUrl 로그인 후 이동할 URL (기본값: /home)
   */
  login: (redirectUrl: string = "/home") => {
    if (typeof window === "undefined") return;

    const fullRedirectUrl = redirectUrl.startsWith("http")
      ? redirectUrl
      : `${window.location.origin}${redirectUrl}`;

    const loginUrl = `${API_BASE}/auth/login?redirect=${encodeURIComponent(
      fullRedirectUrl
    )}`;

    window.location.href = loginUrl;
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    try {
      await request<void>("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      // 로그아웃 실패해도 로그인 페이지로 이동
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    }
  },
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
  auth: authApi,
};
