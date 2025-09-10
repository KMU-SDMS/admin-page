const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/";

console.warn("API_BASE_URL:", API_BASE);

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
    console.error(`API request failed: ${url}`, error);
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

export const api = {
  get: apiGet,
  post: apiPost,
  patch: apiPatch,
  delete: apiDelete,
};
