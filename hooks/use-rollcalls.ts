"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Rollcall, RollcallQuery } from "@/lib/types";

export function useRollcalls(params: RollcallQuery = {}) {
  const [data, setData] = useState<Rollcall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRollcalls = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // API 호출
      const rollcalls = await api.get<Rollcall[]>("/rollcalls", params);
      setData(rollcalls);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch rollcalls"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const mutate = async (
    rollcallData: Partial<Rollcall> & {
      date: string;
      studentId: number;
      present: boolean;
      status?: "PRESENT" | "LEAVE" | "ABSENT";
      cleaningStatus?: "PASS" | "FAIL" | "NONE";
    }
  ) => {
    try {
      // API 호출로 점호 기록 생성/업데이트
      const updatedRollcall = await api.post<Rollcall>(
        "/rollcalls",
        rollcallData
      );

      // 로컬 상태 업데이트
      const existingIndex = data.findIndex(
        (r) =>
          r.studentId === rollcallData.studentId && r.date === rollcallData.date
      );

      if (existingIndex >= 0) {
        // 기존 점호 기록 업데이트
        const updatedData = [...data];
        updatedData[existingIndex] = updatedRollcall;
        setData(updatedData);
      } else {
        // 새 점호 기록 추가
        setData((prevData) => [...prevData, updatedRollcall]);
      }
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchRollcalls();
  }, [params.date, params.roomId, params.name, params.present]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRollcalls,
    mutate,
  };
}
