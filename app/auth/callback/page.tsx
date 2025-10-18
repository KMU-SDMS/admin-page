"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

/**
 * OAuth 콜백 페이지
 * 인증 서버에서 리다이렉트된 후 처리
 */
export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      setError("인증 코드가 없습니다.");
      return;
    }

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

    // 백엔드로 code 전송하여 토큰 교환
    fetch(`${API_BASE}/auth/callback?code=${code}&state=${state}`, {
      credentials: "include", // 쿠키 포함
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("인증 처리 실패");
        }
        return response.json();
      })
      .then((data) => {
        // 토큰을 받았으면 저장 (예: localStorage, cookie 등)
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }

        // 원래 가려던 페이지로 리다이렉트
        window.location.href = redirectUrl;
      })
      .catch((err) => {
        console.error("인증 오류:", err);
        setError("로그인 처리 중 오류가 발생했습니다.");
      });
  }, [searchParams]);

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
          로그인 처리 중...
        </h1>
        <p className="text-body-2 text-muted-foreground">
          잠시만 기다려주세요.
        </p>
      </div>
    </div>
  );
}
