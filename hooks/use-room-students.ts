"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { RoomStudent } from "@/lib/types";

export function useRoomStudents(roomId: string) {
  const [data, setData] = useState<RoomStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // API 호출
      const students = await api.get<RoomStudent[]>(`/students/${roomId}`);
      setData(students);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch room students"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomStudents();
    }
  }, [roomId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRoomStudents,
  };
}
