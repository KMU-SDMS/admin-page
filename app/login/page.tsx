"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * 로그인 페이지
 * 간단한 로그인 버튼만 있는 페이지
 */
export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // 로그인 처리 (추후 구현)
    router.push("/");
  };

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
          <Button onClick={handleLogin} size="lg" className="w-full">
            로그인
          </Button>
        </div>
      </div>
    </div>
  );
}
