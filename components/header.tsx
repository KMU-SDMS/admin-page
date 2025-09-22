"use client";

import { User, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useViewport } from "@/hooks/use-viewport";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { isMobile, isTablet, breakpoint, aspectRatio } = useViewport();
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return '대시보드';
      case '/notices':
        return '공지 시스템';
      case '/bill':
        return '관리비 관리';
      case '/students':
        return '학생 관리';
      case '/rollcall':
        return '출석 관리';
      case '/packages':
        return '택배 관리';
      case '/inquiries':
        return '문의 관리';
      default:
        return '기숙사 관리 시스템';
    }
  };

  return (
    <header className="border-b bg-background px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* 모바일 메뉴 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="h-8 w-8 sm:h-9 sm:w-9 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">{getPageTitle()}</h1>
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
