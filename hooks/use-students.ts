"use client";

import { useState, useEffect } from "react";
import { mockStudents } from "@/lib/mock-data";

// 디버깅을 위한 로그
console.log("mockStudents import:", mockStudents);
console.log("First mock student:", mockStudents[0]);
import type { Student, StudentQuery } from "@/lib/types";

export function useStudents(params: StudentQuery = {}) {
  const [data, setData] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션

      let filteredStudents = [...mockStudents];

      // 호실 필터링
      if (params.roomId) {
        filteredStudents = filteredStudents.filter(
          (student) => student.roomId === params.roomId
        );
      }

      // 이름 검색 필터링
      if (params.name) {
        filteredStudents = filteredStudents.filter((student) =>
          student.name.toLowerCase().includes(params.name!.toLowerCase())
        );
      }

      console.log("useStudents - filteredStudents:", filteredStudents);
      console.log("First student data:", filteredStudents[0]);
      setData(filteredStudents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [params.roomId, params.name]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStudents,
  };
}
