"use client";

import { usePathname } from "next/navigation";
import MobileBottomBar from "@/components/mobile-bottom-bar";

export function MobileBottomBarGuard() {
	const pathname = usePathname();
	const hide = pathname?.startsWith("/auth");
	if (hide) return null;
	return <MobileBottomBar />;
}

export default MobileBottomBarGuard;
