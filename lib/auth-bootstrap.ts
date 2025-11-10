/**
 * 부트스트랩 기반 세션 복구 (Pure Optimistic)
 * 앱 시작/새로고침 시 로그인 상태를 확인하고 세션을 자동으로 복구
 */

export interface BootstrapResult {
  authenticated: boolean;
  user?: unknown;
}

const SESSION_STORAGE_KEY = "auth_has_session";
const SESSION_VERIFY_AT_KEY = "auth_session_verified_at";

/**
 * API 서버 베이스 URL
 * - 클라이언트 번들에 주입된 공개 환경변수 우선
 * - 개발 환경(로컬 호스트)에서는 localhost:3000 기본값
 */
function getApiBase(): string | null {
  // NEXT_PUBLIC_* 는 클라이언트 번들에 인라인됨
  const fromEnv =
    typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined)
      : undefined;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv;
  }

  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      return "http://localhost:3000";
    }
  }
  // 프로덕션에서 환경변수 미설정 시 null 반환 (명시적 실패)
  return null;
}

/**
 * 세션 유효성 검증
 * - 쿠키가 실제로 포함되어 API가 200을 돌려주는지 가벼운 엔드포인트로 확인
 * - 실패(401/네트워크 에러) 시 false
 */
async function verifySessionWithApi(): Promise<boolean> {
  const apiBase = getApiBase();
  if (!apiBase) {
    // API BASE 미설정: 검증 불가 → 보수적으로 false 처리하여 루프 방지
    return false;
  }

  try {
    // 가장 가벼운 목록 엔드포인트로 검증 (권한 필요 가정)
    const url = `${apiBase}/api/notices?limit=1&page=1`;
    const res = await fetch(url, { credentials: "include", method: "GET" });
    if (res.ok) {
      return true;
    }
    // 권한 없음 혹은 기타 오류
    return false;
  } catch {
    // 네트워크 오류 등
    return false;
  }
}

/**
 * 앱 시작 시 세션 복구 (Pure Optimistic 방식)
 *
 * Pure Optimistic 접근:
 * - localStorage에 세션 상태가 있으면 즉시 인증으로 간주
 * - localStorage가 없으면 즉시 미인증으로 간주
 * - API 검증 없음! (매우 빠름)
 * - 실제 페이지에서 API 호출 시 401 발생하면 그때 /auth로 리다이렉트
 *
 * Cross-Origin 환경:
 * - ps/session 쿠키는 API Gateway 도메인에 설정됨
 * - JavaScript로는 읽을 수 없지만, fetch()로 API 요청 시 자동 전송됨
 * - localStorage로 세션 존재 여부를 마커로 추적
 *
 * 흐름:
 * 1. 로그인 성공 → markSessionAsActive() → localStorage 저장
 * 2. 새 창/탭 → localStorage 확인 → 즉시 /home으로
 * 3. API 호출 → 쿠키 자동 전송 → 성공
 * 4. 만약 401 → clearSessionState() → /auth로 리다이렉트
 *
 * 장점:
 * - 부트스트랩 즉시 완료 (네트워크 요청 0)
 * - 새 창에서 불필요한 sid 재발급 방지
 * - 컴퓨터 재시작 후에도 localStorage 유지
 */
export async function bootstrapAuth(): Promise<BootstrapResult> {
  try {
    // localStorage에서 세션 상태 확인
    const hasSession = localStorage.getItem(SESSION_STORAGE_KEY) === "true";

    if (!hasSession) {
      return { authenticated: false };
    }

    // 최근 검증 시각 확인 (짧은 TTL로 재검증 최소화)
    const verifiedAtRaw = localStorage.getItem(SESSION_VERIFY_AT_KEY);
    const now = Date.now();
    const ttlMs = 5 * 60 * 1000; // 5분
    if (verifiedAtRaw) {
      const verifiedAt = Number(verifiedAtRaw);
      if (!Number.isNaN(verifiedAt) && now - verifiedAt < ttlMs) {
        return { authenticated: true };
      }
    }

    // 새 기기/새 세션에서는 실제 API로 쿠키 유효성을 한 번 확인
    const valid = await verifySessionWithApi();
    if (valid) {
      localStorage.setItem(SESSION_VERIFY_AT_KEY, String(now));
      return { authenticated: true };
    }

    // 검증 실패 → 세션 마커 제거
    clearSessionState();
    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}

/**
 * 로그인 성공 시 호출 - localStorage에 세션 상태 저장
 */
export function markSessionAsActive() {
  localStorage.setItem(SESSION_STORAGE_KEY, "true");
  localStorage.setItem(SESSION_VERIFY_AT_KEY, String(Date.now()));
}

/**
 * 로그아웃 또는 401 에러 시 호출 - localStorage 세션 상태 제거
 */
export function clearSessionState() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(SESSION_VERIFY_AT_KEY);
}
