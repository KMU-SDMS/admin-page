/**
 * 부트스트랩 기반 세션 복구 (Pure Optimistic)
 * 앱 시작/새로고침 시 로그인 상태를 확인하고 세션을 자동으로 복구
 */

export interface BootstrapResult {
  authenticated: boolean;
  user?: unknown;
}

const SESSION_STORAGE_KEY = "auth_has_session";

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

    if (hasSession) {
      return { authenticated: true };
    } else {
      return { authenticated: false };
    }
  } catch {
    return { authenticated: false };
  }
}

/**
 * 로그인 성공 시 호출 - localStorage에 세션 상태 저장
 */
export function markSessionAsActive() {
  localStorage.setItem(SESSION_STORAGE_KEY, "true");
}

/**
 * 로그아웃 또는 401 에러 시 호출 - localStorage 세션 상태 제거
 */
export function clearSessionState() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
