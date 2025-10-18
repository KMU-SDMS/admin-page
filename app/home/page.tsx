import { redirect } from "next/navigation";

/**
 * 대시보드 페이지
 * 현재는 공지사항으로 리다이렉트 (추후 수정 예정)
 */
export default function HomePage() {
  redirect("/notices");
}
