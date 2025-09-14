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
      console.log("API에서 받은 학생 데이터:", students);
      console.log(
        "첫 번째 학생의 roomId:",
        students[0]?.roomId,
        typeof students[0]?.roomId
      );
      console.log("필터링할 roomId:", params.roomId, typeof params.roomId);

      let filteredStudents = [...students];

      // 호실 필터링
      if (params.roomId) {
        filteredStudents = filteredStudents.filter(
          (student) => student.roomId === params.roomId
        );
        console.log("필터링 후 학생 수:", filteredStudents.length);
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
  }, [params.roomId, params.name]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStudents,
  };
}
