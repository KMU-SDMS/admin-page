import { NextResponse } from "next/server";
import type { Room } from "@/lib/types";

// 동일한 생성 로직을 간단하게 재사용
function buildRooms(): Room[] {
  return Array.from({ length: 5 })
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
}

export async function generateStaticParams() {
  const rooms = buildRooms();
  return rooms.map((room) => ({
    id: String(room.id),
  }));
}

export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  const rooms = buildRooms();
  const id = Number.parseInt(context.params.id, 10);
  const room = rooms.find((r) => r.id === id);
  if (!room) {
    return new NextResponse("Not Found", { status: 404 });
  }
  return NextResponse.json(room);
}


