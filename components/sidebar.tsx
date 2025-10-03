"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Package,
  MessageSquare,
  Megaphone,
  Users,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useViewport } from "@/hooks/use-viewport";

const navigation = [
  {
    name: "공지 시스템",
    href: "/notices",
    icon: Megaphone,
  },
  {
    name: "관리비 관리",
    href: "/bill",
    icon: Receipt,
  },
  {
    name: "학생 관리",
    href: "/students",
    icon: Users,
  },
];

interface SidebarProps {
  onMobileClose?: () => void;
}

export function Sidebar({ onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { isMobile } = useViewport();

  return (
    <aside
      className={cn(
        "border-r border-border bg-sidebar transition-all duration-300 h-screen",
        // 모바일에서는 항상 확장된 상태, 데스크톱에서는 collapsed 상태에 따라
        "w-52",
        collapsed
          ? "lg:w-16 sidebar-responsive-collapsed"
          : "lg:w-52 sidebar-responsive"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Toggle Button */}
        <div className="flex justify-end sidebar-responsive-padding">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // 모바일에서는 사이드바 닫기, 데스크톱에서는 축소/확장
              if (isMobile) {
                onMobileClose?.();
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="sidebar-responsive-button"
          >
            {collapsed ? (
              <ChevronRight className="sidebar-responsive-icon" />
            ) : (
              <ChevronLeft className="sidebar-responsive-icon" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 sidebar-responsive-padding">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose} // 모바일에서 링크 클릭 시 사이드바 닫기
                className={cn(
                  "flex items-center sidebar-responsive-gap rounded-lg sidebar-responsive-padding sidebar-responsive-text font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  // 모바일에서는 항상 텍스트 표시, 데스크톱에서는 collapsed 상태에 따라
                  "lg:justify-start",
                  collapsed && "lg:justify-center"
                )}
              >
                <item.icon className="sidebar-responsive-icon flex-shrink-0" />
                <span className={cn("block", collapsed && "lg:hidden")}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
