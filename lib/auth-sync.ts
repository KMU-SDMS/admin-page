/**
 * 탭/창 간 인증 상태 동기화
 * BroadcastChannel API를 사용하여 여러 탭에서 로그인 상태를 공유
 */

type AuthSyncMessage = { type: "login" } | { type: "logout" };

type AuthSyncListener = (message: AuthSyncMessage) => void;

class AuthSync {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<AuthSyncListener> = new Set();

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel("auth-sync");
      this.channel.onmessage = (event: MessageEvent<AuthSyncMessage>) => {
        this.listeners.forEach((listener) => listener(event.data));
      };
    }
  }

  /**
   * 다른 탭에 로그인 이벤트 브로드캐스트
   */
  notifyLogin() {
    if (this.channel) {
      this.channel.postMessage({ type: "login" });
    }
  }

  /**
   * 다른 탭에 로그아웃 이벤트 브로드캐스트
   */
  notifyLogout() {
    if (this.channel) {
      this.channel.postMessage({ type: "logout" });
    }
  }

  /**
   * 인증 동기화 메시지 리스너 추가
   */
  addListener(listener: AuthSyncListener) {
    this.listeners.add(listener);
  }

  /**
   * 인증 동기화 메시지 리스너 제거
   */
  removeListener(listener: AuthSyncListener) {
    this.listeners.delete(listener);
  }

  /**
   * 채널 정리
   */
  cleanup() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

// 싱글톤 인스턴스
export const authSync = new AuthSync();
