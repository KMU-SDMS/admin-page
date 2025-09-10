"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Student, StudentQuery } from "@/lib/types";

export function useStudents(params: StudentQuery = {}) {
  const [data, setData] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // API 호출
      const students = await api.get<Student[]>("/students", params);
      setData(students);
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
