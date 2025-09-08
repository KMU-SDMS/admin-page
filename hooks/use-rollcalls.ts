"use client";

import { useState, useEffect } from "react";
import { mockRollcalls } from "@/lib/mock-data";
import type { Rollcall, RollcallQuery } from "@/lib/types";

export function useRollcalls(params: RollcallQuery = {}) {
  const [data, setData] = useState<Rollcall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRollcalls = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션

      let filteredRollcalls = [...mockRollcalls];

      // 날짜 필터링
      if (params.date) {
        filteredRollcalls = filteredRollcalls.filter(
          (rollcall) => rollcall.date === params.date,
        );
      }

      // 출석 상태 필터링
      if (params.present !== undefined) {
        filteredRollcalls = filteredRollcalls.filter(
          (rollcall) => rollcall.present === params.present,
        );
      }

      setData(filteredRollcalls);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch rollcalls",
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
    },
  ) => {
    try {
      console.log("mutate 호출됨:", rollcallData);
      const existingIndex = data.findIndex(
        (r) =>
          r.studentId === rollcallData.studentId &&
          r.date === rollcallData.date,
      );

      console.log("기존 인덱스:", existingIndex);

      if (existingIndex >= 0) {
        // 기존 점호 기록 업데이트
        const updatedData = [...data];
        updatedData[existingIndex] = {
          ...updatedData[existingIndex],
          ...rollcallData,
        };
        console.log("기존 기록 업데이트:", updatedData[existingIndex]);
        setData(updatedData);
        console.log("setData 호출됨, 새로운 데이터:", updatedData);
      } else {
        // 새 점호 기록 추가
        const newRollcall: Rollcall = {
          id: Math.max(...data.map((r) => r.id), 0) + 1,
          studentId: rollcallData.studentId,
          roomId: rollcallData.roomId,
          date: rollcallData.date,
          present: rollcallData.present,
          status: rollcallData.status,
          note: rollcallData.note || "",
        };
        console.log("새 기록 추가:", newRollcall);
        const newData = [...data, newRollcall];
        setData(newData);
        console.log("setData 호출됨, 새로운 데이터:", newData);
      }
    } catch (err) {
      console.error("mutate 에러:", err);
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
