"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Point } from "@/lib/types";

export function usePoints(studentId?: number) {
  const [data, setData] = useState<Point[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // API 호출
      const params = studentId ? { studentId } : {};
      const points = await api.get<Point[]>("/points", params);
      setData(points);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch points");
    } finally {
      setIsLoading(false);
    }
  };

  const mutate = async (pointData: {
    studentId: number;
    type: "MERIT" | "DEMERIT";
    score: number;
    reason: string;
    date?: string;
  }) => {
    try {
      // API 호출로 상벌점 생성
      const newPoint = await api.post<Point>("/points", pointData);
      setData((prevData) => [...prevData, newPoint]);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [studentId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchPoints,
    mutate,
  };
}
