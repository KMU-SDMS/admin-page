import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인 - 기숙사 관리 시스템",
  description: "기숙사 관리 시스템 로그인",
};

/**
 * 로그인 페이지 전용 레이아웃
 * 사이드바 없이 중앙 정렬된 로그인 폼만 표시
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
