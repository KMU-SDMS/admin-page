import { NextResponse } from "next/server";
import type { Rollcall } from "@/lib/types";

// Ensure global store exists (shared with GET route)
declare global {
  var mockRollcallsStore: Rollcall[];
}

if (!global.mockRollcallsStore) {
  global.mockRollcallsStore = [];
}

export async function POST(request: Request) {
  const body = await request.json();
  const { studentId, date, present, status, cleaningStatus, note, roomId } = body;

  // Convert studentId to number if possible, or keep as is if your system uses string IDs
  // The type definition says studentId is number.
  const sid = Number(studentId);

  const existingIndex = global.mockRollcallsStore.findIndex(
    (r) => r.studentId === sid && r.date === date
  );

  const newRollcall: Rollcall = {
    id: existingIndex >= 0 ? global.mockRollcallsStore[existingIndex].id : Date.now(),
    studentId: sid,
    date,
    roomId: Number(roomId) || 0, // Should be passed from client
    present,
    status,
    cleaningStatus,
    note,
    checkedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    global.mockRollcallsStore[existingIndex] = {
      ...global.mockRollcallsStore[existingIndex],
      ...newRollcall,
    };
  } else {
    global.mockRollcallsStore.push(newRollcall);
  }

  return NextResponse.json(newRollcall);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;

  const index = global.mockRollcallsStore.findIndex((r) => r.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Rollcall not found" }, { status: 404 });
  }

  global.mockRollcallsStore[index] = {
    ...global.mockRollcallsStore[index],
    ...updates,
  };

  return NextResponse.json(global.mockRollcallsStore[index]);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const numId = Number(id);
  global.mockRollcallsStore = global.mockRollcallsStore.filter((r) => r.id !== numId);

  return NextResponse.json({ message: "Deleted" });
}
