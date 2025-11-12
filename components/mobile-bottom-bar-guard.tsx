"use client";

import { usePathname } from "next/navigation";
import MobileBottomBar from "@/components/mobile-bottom-bar";

export function MobileBottomBarGuard() {
	const pathname = usePathname();
	const hide = pathname?.startsWith("/auth");

	// /auth 경로만 제외하고 모두 표시
	if (hide) return null;

	return <MobileBottomBar />;
}

export default MobileBottomBarGuard;
