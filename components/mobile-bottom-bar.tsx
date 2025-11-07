"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Megaphone, CreditCard, Menu } from "lucide-react";

interface NavItem {
  key: "notices" | "bill" | "all";
  label: string;
  href: string;
  Icon: typeof Megaphone;
}

export function MobileBottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  const items: NavItem[] = useMemo(() => (
    [
      { key: "notices", label: "공지", href: "/notices", Icon: Megaphone },
      { key: "bill", label: "관리비", href: "/bill", Icon: CreditCard },
      { key: "all", label: "전체", href: "/home", Icon: Menu },
    ]
  ), []);

  const isActive = (href: string) => {
    if (!pathname) return false;
    // 활성화 기준: 현재 경로가 href로 시작
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      className="sm:hidden fixed left-0 right-0 bottom-0 z-40"
      style={{ height: 78, backgroundColor: "var(--color-semantic-background-normal-alternative)" }}
    >
      <div className="h-full grid grid-cols-3">
        {items.map(({ key, label, href, Icon }) => {
          const active = isActive(href);
          const color = active
            ? "var(--color-semantic-label-strong)"
            : "var(--color-semantic-label-alternative)";
          return (
            <button
              key={key}
              onClick={() => router.push(href)}
              className="flex flex-col items-center justify-center gap-1"
              aria-current={active ? "page" : undefined}
              style={{ color }}
            >
              <Icon className="w-6 h-6" />
              <span
                style={{
                  fontSize: "var(--typography-label-1-normal-bold-fontSize)",
                  fontWeight: "var(--typography-label-1-normal-bold-fontWeight)",
                  lineHeight: "var(--typography-label-1-normal-bold-lineHeight)",
                  letterSpacing: "var(--typography-label-1-normal-bold-letterSpacing)",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomBar;


