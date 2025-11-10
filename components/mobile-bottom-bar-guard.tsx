"use client";

import { usePathname } from "next/navigation";
import MobileBottomBar from "@/components/mobile-bottom-bar";
import { useAuth } from "@/lib/auth-context";

export function MobileBottomBarGuard() {
	const { isAuthenticated, isLoading } = useAuth();
	const pathname = usePathname();
	const hide = pathname?.startsWith("/auth");

	// 인증 로딩 중에는 깜빡임 방지를 위해 렌더링하지 않음
	if (isLoading) return null;

	// 로그인 화면이거나 비인증 상태에서는 하단바 표시 안 함
	if (hide || !isAuthenticated) return null;

	return <MobileBottomBar />;
}

export default MobileBottomBarGuard;
