"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Megaphone,
  ChevronDown,
  User,
  Receipt,
  Users,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "공지사항",
    href: "/notices",
    icon: Megaphone,
  },
  {
    name: "관리비 납부",
    href: "/bill",
    icon: Receipt,
  },
  {
    name: "외박계 관리",
    href: "/overnight-stays",
    icon: Moon,
  },
  {
    name: "점호 관리(미완)",
    href: "/rollcall",
    icon: Users,
  },
  {
    name: "학생 관리",
    href: "/students",
    icon: User,
  },
];

interface SidebarProps {
  onMobileClose?: () => void;
}

export function Sidebar({ onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-[317px] h-[1080px] bg-[var(--color-background-normal-normal)] flex flex-col">
      {/* 기숙사 정보 영역 - 94px spacing */}
      <div className="mt-[94px] px-6">
        <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-[var(--color-label-normal)] text-[var(--typography-body-1-normal-bold-fontSize)] font-[var(--typography-body-1-normal-bold-fontWeight)] leading-[var(--typography-body-1-normal-bold-lineHeight)] tracking-[var(--typography-body-1-normal-bold-letterSpacing)]">
            정릉 제 2기숙사
          </span>
          <ChevronDown className="w-4 h-4 text-[var(--color-label-neutral)]" />
        </div>
        <div className="mt-1">
          <span className="text-[var(--color-label-neutral)] text-[var(--typography-label-1-normal-medium-fontSize)] font-[var(--typography-label-1-normal-medium-fontWeight)] leading-[var(--typography-label-1-normal-medium-lineHeight)] tracking-[var(--typography-label-1-normal-medium-letterSpacing)]">
            국민대학교
          </span>
        </div>
      </div>

      {/* 탭 영역 - 41px spacing */}
      <div className="mt-10 px-5 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "w-[277px] h-[62px] flex items-center gap-3 px-4 rounded-lg transition-colors",
                isActive
                  ? "text-[var(--color-label-strong)] hover:bg-[#222230]"
                  : "text-[var(--color-label-neutral)] hover:bg-[#222230] hover:text-[var(--color-label-strong)]"
              )}
            >
              <item.icon
                className={cn(
                  "w-6 h-6 flex-shrink-0",
                  isActive
                    ? "text-[var(--color-label-strong)]"
                    : "text-[var(--color-label-alternative)]"
                )}
              />
              <span
                className={cn(
                  "transition-all",
                  isActive
                    ? "text-[var(--typography-headline-1-bold-fontSize)] font-[var(--typography-headline-1-bold-fontWeight)] leading-[var(--typography-headline-1-bold-lineHeight)] tracking-[var(--typography-headline-1-bold-letterSpacing)]"
                    : "text-[var(--typography-headline-1-medium-fontSize)] font-[var(--typography-headline-1-medium-fontWeight)] leading-[var(--typography-headline-1-medium-lineHeight)] tracking-[var(--typography-headline-1-medium-letterSpacing)]"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>

    </aside>
  );
}
