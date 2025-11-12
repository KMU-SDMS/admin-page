import { NextResponse } from "next/server";
import type { Room } from "@/lib/types";

// 간단한 목업 데이터: 1~5층, 각 층 10개 호실
const rooms: Room[] = Array.from({ length: 5 })
  .flatMap((_, floorIdx) => {
    const floor = floorIdx + 1;
    return Array.from({ length: 10 }).map((__, i) => {
      const roomNo = floor * 100 + (i + 1);
      return {
        id: roomNo,
        name: `${roomNo}호`,
        floor,
        capacity: 2,
      } as Room;
    });
  });

export async function GET() {
  return NextResponse.json(rooms);
}


