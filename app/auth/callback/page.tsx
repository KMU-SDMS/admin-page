"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { request } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { authSync } from "@/lib/auth-sync";
import { markSessionAsActive } from "@/lib/auth-bootstrap";

/**
 * OAuth 콜백 페이지
 * 인증 서버에서 리다이렉트된 후 처리
 */
export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isLoading || processing) {
      return;
    }

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // state에서 redirect URL 추출
    let redirectUrl = "/home";
    if (state) {
      try {
        const decodedState = JSON.parse(atob(state));
        redirectUrl = decodedState.r || "/home";
      } catch (e) {
        console.error("State 파싱 실패:", e);
      }
    }

    const processCallback = async () => {
      setProcessing(true);

      try {
        if (isAuthenticated) {
          window.location.href = redirectUrl;
          return;
        }

        if (!code) {
          setError("인증 코드가 없습니다.");
          return;
        }

        await request<{ success: boolean }>(
          `/auth/callback?code=${code}&state=${state}`,
          {
            method: "GET",
          }
        );

        markSessionAsActive();
        await refresh();
        authSync.notifyLogin();
        window.location.href = redirectUrl;
      } catch (err) {
        console.error("인증 오류:", err);
        setError("로그인 처리 중 오류가 발생했습니다.");
        setProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, isAuthenticated, isLoading, refresh, processing]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 px-4 text-center">
          <h1 className="text-heading-1 font-bold text-destructive">
            로그인 실패
          </h1>
          <p className="text-body-2 text-muted-foreground">{error}</p>
          <a
            href="/auth"
            className="inline-block mt-4 text-primary hover:underline"
          >
            다시 시도하기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4 text-center">
        <h1 className="text-heading-1 font-bold text-foreground">
          {isLoading ? "세션 확인 중..." : "로그인 처리 중..."}
        </h1>
        <p className="text-body-2 text-muted-foreground">
          잠시만 기다려주세요.
        </p>
      </div>
    </div>
  );
}
