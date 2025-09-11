"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Room } from "@/lib/types";

export function useRooms() {
  const [data, setData] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // API 호출
      const rooms = await api.get<Room[]>("/rooms");
      setData(rooms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rooms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRooms,
  };
}
