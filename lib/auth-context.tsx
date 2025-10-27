"use client";

/**
 * 전역 인증 상태 관리
 * React Context로 앱 전체에서 인증 상태를 공유
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  bootstrapAuth,
  type BootstrapResult,
  clearSessionState,
} from "./auth-bootstrap";
import { authSync } from "./auth-sync";
import { authApi } from "./api";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: unknown;
  login: (redirectUrl?: string) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<unknown>(undefined);

  /**
   * 세션 복구 (부트스트랩)
   */
  const refresh = useCallback(async () => {
    console.log("[AuthContext] 🔄 refresh() 호출");
    setIsLoading(true);
    try {
      const result: BootstrapResult = await bootstrapAuth();
      console.log("[AuthContext] 부트스트랩 결과:", result);
      setIsAuthenticated(result.authenticated);
      setUser(result.user);
      setIsLoading(false);
      console.log("[AuthContext] ✅ 상태 업데이트 완료:", {
        authenticated: result.authenticated,
      });
    } catch (error) {
      console.error("[AuthContext] ❌ 세션 복구 실패:", error);
      setIsAuthenticated(false);
      setUser(undefined);
      setIsLoading(false);
    }
  }, []);

  /**
   * 로그인 시작
   */
  const login = useCallback((redirectUrl: string = "/home") => {
    authApi.login(redirectUrl);
  }, []);

  /**
   * 로그아웃
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      // 세션 상태 제거
      clearSessionState();

      setIsAuthenticated(false);
      setUser(undefined);

      // 다른 탭에 로그아웃 알림
      authSync.notifyLogout();
    }
  }, []);

  /**
   * 초기 부트스트랩 + 탭 간 동기화 설정
   */
  useEffect(() => {
    // 1. 앱 시작 시 부트스트랩
    refresh();

    // 2. 탭 간 동기화 리스너 설정
    const handleSyncMessage = (message: { type: string }) => {
      if (message.type === "login") {
        // 다른 탭에서 로그인 → 세션 복구
        refresh();
      } else if (message.type === "logout") {
        // 다른 탭에서 로그아웃 → 세션 상태 제거 및 로컬 상태 업데이트
        clearSessionState();
        setIsAuthenticated(false);
        setUser(undefined);
      }
    };

    authSync.addListener(handleSyncMessage);

    return () => {
      authSync.removeListener(handleSyncMessage);
    };
  }, [refresh]);

  const value: AuthContextValue = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 인증 상태 훅
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
