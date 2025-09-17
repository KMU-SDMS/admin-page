"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useViewport } from "@/hooks/use-viewport";

export function Header() {
  const { isMobile, isTablet, breakpoint, aspectRatio } = useViewport();

  return (
    <header className="border-b bg-background px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <h1 className="text-responsive-xl sm:text-responsive-2xl font-bold">
            공지 시스템
          </h1>
          <p className="hidden sm:block text-muted-foreground text-responsive-xs">
            기숙사 공지사항 작성 및 관리
          </p>
          {/* 개발용 디버그 정보 - 실제 배포시 제거 */}
          {process.env.NODE_ENV === "development" && (
            <div className="hidden lg:block text-xs text-muted-foreground">
              {breakpoint} ({Math.round(aspectRatio * 100) / 100})
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>프로필</DropdownMenuItem>
              <DropdownMenuItem>설정</DropdownMenuItem>
              <DropdownMenuItem>로그아웃</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
