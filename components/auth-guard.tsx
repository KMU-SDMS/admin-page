"use client";

/**
 * 보호된 페이지 래퍼
 * 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
 */

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface AuthGuardProps {
  children: React.ReactNode;
  /**
   * 로딩 중에 표시할 컴포넌트
   */
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // 인증되지 않은 경우 로그인 페이지로 리다이렉트
      // 현재 경로를 저장하여 로그인 후 복귀할 수 있도록 함
      const redirectUrl = encodeURIComponent(pathname || "/home");
      router.push(`/auth?redirect=${redirectUrl}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // 로딩 중
  if (isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="w-full max-w-md space-y-8 px-4 text-center">
            <h1 className="text-heading-1 font-bold text-foreground">
              로딩 중...
            </h1>
            <p className="text-body-2 text-muted-foreground">
              잠시만 기다려주세요.
            </p>
          </div>
        </div>
      )
    );
  }

  // 인증되지 않음 (리다이렉트 중)
  if (!isAuthenticated) {
    return null;
  }

  // 인증됨 - 페이지 렌더링
  return <>{children}</>;
}
