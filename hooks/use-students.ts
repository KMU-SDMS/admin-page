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

      // API에서 학생 목록 가져오기
      const students = await api.students.getAll();

      // 디버깅을 위한 로그

      let filteredStudents = [...students];

      // 호실 필터링
      if (params.roomNumber) {
        filteredStudents = filteredStudents.filter(
          (student) => student.roomNumber === params.roomNumber
        );
      }

      // 이름 검색 필터링
      if (params.name) {
        filteredStudents = filteredStudents.filter((student) =>
          student.name.toLowerCase().includes(params.name!.toLowerCase())
        );
      }

      setData(filteredStudents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [params.roomNumber, params.name]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStudents,
  };
}
