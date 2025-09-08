"use client";

import { useState, useEffect } from "react";
import { mockPoints } from "@/lib/mock-data";
import type { Point } from "@/lib/types";

export function usePoints(studentId?: number) {
  const [data, setData] = useState<Point[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션

      let filteredPoints = [...mockPoints];

      // 특정 학생 ID로 필터링
      if (studentId) {
        filteredPoints = filteredPoints.filter(
          (point) => point.studentId === studentId,
        );
      }

      setData(filteredPoints);
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
      const newPoint: Point = {
        id: Math.max(...data.map((p) => p.id), 0) + 1,
        studentId: pointData.studentId,
        type: pointData.type,
        score: pointData.score,
        reason: pointData.reason,
        date: pointData.date || new Date().toISOString().split("T")[0],
      };

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
