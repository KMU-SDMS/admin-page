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
    console.log("[Callback] useEffect 실행:", {
      isLoading,
      isAuthenticated,
      processing,
    });

    // 부트스트랩이 완료될 때까지 대기
    if (isLoading || processing) {
      console.log("[Callback] 대기 중...");
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

    // 백엔드로 code 전송하여 세션 쿠키 설정
    const processCallback = async () => {
      console.log("[Callback] 🔄 콜백 처리 시작");
      setProcessing(true);

      try {
        // 1. Context에서 인증 상태 확인 (부트스트랩 완료 후)
        if (isAuthenticated) {
          console.log(
            "[Callback] ✅ 이미 유효한 세션이 있습니다. 토큰 발급 건너뜀!"
          );
          window.location.href = redirectUrl;
          return;
        }

        // 2. 유효한 세션이 없을 때만 code 처리
        if (!code) {
          console.log("[Callback] ❌ 인증 코드가 없습니다.");
          setError("인증 코드가 없습니다.");
          return;
        }

        console.log("[Callback] 🔄 새로운 토큰 발급 시작...");

        // 3. 백엔드로 code 전송하여 세션 쿠키 설정 (HttpOnly)
        await request<{ success: boolean }>(
          `/auth/callback?code=${code}&state=${state}`,
          {
            method: "GET",
          }
        );

        console.log("[Callback] ✅ 토큰 발급 완료 (HttpOnly 쿠키 설정됨)");

        // 4. localStorage에 세션 활성화 표시
        markSessionAsActive();

        // 5. 세션 쿠키가 설정되었으므로 Context 상태 갱신
        await refresh();

        // 6. 다른 탭에 로그인 알림
        authSync.notifyLogin();

        // 7. 리다이렉트
        window.location.href = redirectUrl;
      } catch (err) {
        console.error("[Callback] ❌ 인증 오류:", err);
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
