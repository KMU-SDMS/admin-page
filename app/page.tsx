import { redirect } from "next/navigation";

export default function RootPage() {
  // Pure Optimistic: 일단 /home으로 이동
  // localStorage에 세션이 있으면 정상 렌더링
  // 세션 없으면 API 호출 시 401 → 자동으로 /auth로 리다이렉트
  redirect("/home");
}
