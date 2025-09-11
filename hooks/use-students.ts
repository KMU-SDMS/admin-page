"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Student } from "@/lib/types";

export function useStudents() {
  const [data, setData] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 전체 학생 데이터 가져오기 (필터링 없음)
      const students = await api.get<Student[]>("/students");
      setData(students);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStudents,
  };
}
