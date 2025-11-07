"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/use-viewport";

/**
 * 홈 진입 시 뷰포트에 따라 리디렉션
 * - xs(모바일) → /bill
 * - 그 외 → /notices
 */
export default function HomePage() {
  const router = useRouter();
  const breakpoint = useBreakpoint();

  useEffect(() => {
    if (breakpoint === "xs") {
      router.replace("/bill");
    } else {
      router.replace("/notices");
    }
  }, [breakpoint, router]);

  return null;
}
