"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // Pure Optimistic: 인증 상태에 따라 리디렉트
    // localStorage에 세션이 있으면 /home으로
    // 세션 없으면 /auth로
    if (isAuthenticated) {
      router.push("/home");
    } else {
      router.push("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  // 로딩 중
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4 text-center">
        <h1 className="text-heading-1 font-bold text-foreground">로딩 중...</h1>
        <p className="text-body-2 text-muted-foreground">
          잠시만 기다려주세요.
        </p>
      </div>
    </div>
  );
}
