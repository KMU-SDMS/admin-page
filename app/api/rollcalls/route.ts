import { NextResponse } from "next/server";
import type { Rollcall } from "@/lib/types";

// Global storage for mock data to persist across hot reloads
declare global {
  var mockRollcallsStore: Rollcall[];
}

if (!global.mockRollcallsStore) {
  global.mockRollcallsStore = [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const roomId = searchParams.get("roomId");
  const name = searchParams.get("name");

  let filtered = [...global.mockRollcallsStore];

  if (date) {
    filtered = filtered.filter((r) => r.date === date);
  }

  if (roomId) {
    filtered = filtered.filter((r) => r.roomId === Number(roomId));
  }

  // Name filtering would require joining with students, but for mock we can skip or assume basic filtering
  // Since we don't have students in this store, we can't filter by name easily unless we pass studentId.
  // For now, we'll return the filtered list.

  return NextResponse.json(filtered);
}
