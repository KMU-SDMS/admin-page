"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

/**
 * 로그인 페이지
 * 간단한 로그인 버튼만 있는 페이지
 */
export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirectParam = searchParams.get("redirect");
      const redirectUrl = redirectParam
        ? decodeURIComponent(redirectParam)
        : "/home";
      router.push(redirectUrl);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  const handleLogin = () => {
    if (authLoading) {
      return;
    }

    if (isAuthenticated) {
      const redirectParam = searchParams.get("redirect");
      const redirectUrl = redirectParam
        ? decodeURIComponent(redirectParam)
        : "/home";
      router.push(redirectUrl);
      return;
    }

    setIsLoggingIn(true);
    const redirectParam = searchParams.get("redirect");
    const redirectUrl = redirectParam
      ? decodeURIComponent(redirectParam)
      : "/home";
    login(redirectUrl);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 px-4 text-center">
          <h1 className="text-heading-1 font-bold text-foreground">
            세션 확인 중...
          </h1>
          <p className="text-body-2 text-muted-foreground">
            잠시만 기다려주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-heading-1 font-bold text-foreground">
            기숙사 관리 시스템
          </h1>
          <p className="mt-2 text-body-2 text-muted-foreground">
            관리자 페이지에 로그인하세요
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleLogin}
            size="lg"
            className="w-full"
            disabled={isLoggingIn || authLoading}
          >
            {authLoading
              ? "세션 확인 중..."
              : isLoggingIn
              ? "로그인 중..."
              : "로그인"}
          </Button>
        </div>
      </div>
    </div>
  );
}
