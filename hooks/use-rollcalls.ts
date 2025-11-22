"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Rollcall, RollcallQuery } from "@/lib/types";

export function useRollcalls(params: RollcallQuery = {}) {
  const [data, setData] = useState<Rollcall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRollcalls = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // API 호출
      const rollcalls = await api.rollcalls.getAll(params);
      // Deduplicate by studentId, keeping the latest (assumes later entries have higher id)
      const deduped: Record<string, Rollcall> = {};
      rollcalls.forEach((rc) => {
        const key = String(rc.studentId);
        // If existing, keep the one with higher id (more recent)
        if (!deduped[key] || (rc.id && deduped[key].id && rc.id > deduped[key].id)) {
          deduped[key] = rc;
        }
      });
      const uniqueRollcalls = Object.values(deduped);
      console.log("Fetched rollcalls detailed:", JSON.stringify(uniqueRollcalls, null, 2));
      setData(uniqueRollcalls);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch rollcalls"
      );
    } finally {
      setIsLoading(false);
    }
  }, [params.date, params.roomId, params.name, params.present]);

  const mutate = async (
    rollcallData: Partial<Rollcall> & {
      date: string;
      studentId: number | string; // number (id) 또는 string (학번)
      present: boolean;
      status?: "PRESENT" | "LEAVE" | "ABSENT";
      cleaningStatus?: "PASS" | "FAIL" | "NONE";
      note?: string;
    }
  ) => {
    try {
      // API 호출로 점호 기록 생성/수정 (Upsert)
      // 스키마: studentId(string), date(string), present(boolean), note(string)
      // status(외박/결석)는 present(true/false)로 매핑됨
      // cleaningStatus는 API 스키마에 없으므로 전송하지 않음
      const isPresent = rollcallData.status === "PRESENT";
      
      // API 호출로 점호 기록 생성/수정 (Upsert)
      await api.rollcalls.upsert({
        studentId: String(rollcallData.studentId),
        date: rollcallData.date,
        present: isPresent,
        note: rollcallData.note,
      });

      // 데이터 갱신을 위해 refetch 호출
      // 낙관적 업데이트(Optimistic Update)는 복잡성을 줄이기 위해 일단 제거하고,
      // 확실한 데이터 동기화를 위해 API 재호출에 의존합니다.
      await fetchRollcalls();
    } catch (err) {
      throw err;
    }
  };

  // update 메서드는 upsert로 통합되었으므로 제거하거나 mutate를 호출하도록 변경
  const update = async (
    rollcallData: {
      id: number;
      present?: boolean;
      status?: "PRESENT" | "LEAVE" | "ABSENT";
      cleaningStatus?: "PASS" | "FAIL" | "NONE";
      note?: string;
    }
  ) => {
    // update 메서드는 더 이상 사용되지 않아야 하지만, 호환성을 위해 남겨둔다면 에러를 던지거나 로그를 남김
    console.warn("useRollcalls.update is deprecated. Use mutate instead.");
  };

  const deleteRollcall = async (id: number) => {
    try {
      // API 호출로 점호 기록 삭제
      await api.rollcalls.delete(id);

      // 로컬 상태에서 제거
      setData((prevData) => prevData.filter((r) => r.id !== id));

      // 데이터 갱신을 위해 refetch 호출
      await fetchRollcalls();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchRollcalls();
  }, [fetchRollcalls]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRollcalls,
    mutate,
    update,
    delete: deleteRollcall,
  };
}
