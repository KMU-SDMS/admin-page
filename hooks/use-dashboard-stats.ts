"use client";

import { useState, useEffect } from "react";
import { useStudents } from "./use-students";
import { useRollcalls } from "./use-rollcalls";
import { usePoints } from "./use-points";
import type { Student } from "@/lib/types";

interface DashboardStats {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  outLeaveCount: number;
}

interface StudentWithPoints extends Student {
  meritPoints: number;
  demeritPoints: number;
  totalScore: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    presentCount: 0,
    absentCount: 0,
    outLeaveCount: 0,
  });

  const [topStudents, setTopStudents] = useState<StudentWithPoints[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: rollcalls, isLoading: rollcallsLoading } = useRollcalls({
    date: new Date().toISOString().split("T")[0], // Today's date
  });
  const { data: points, isLoading: pointsLoading } = usePoints();

  useEffect(() => {
    if (studentsLoading || rollcallsLoading || pointsLoading) {
      setIsLoading(true);
      return;
    }

    // Calculate roll call stats
    const totalStudents = students.length;
    const outLeaveCount = 0; // status 필드가 없으므로 0으로 설정

    const studentsWithRollcalls = students.filter((student) =>
      rollcalls.some((r) => r.studentId === student.id)
    );

    const presentCount = rollcalls.filter((r) => r.present).length;
    const absentCount = rollcalls.filter((r) => !r.present).length;

    setStats({
      totalStudents,
      presentCount,
      absentCount,
      outLeaveCount,
    });

    // Calculate top students by points
    const studentPointsMap = new Map<
      number,
      { merit: number; demerit: number }
    >();

    points.forEach((point) => {
      const current = studentPointsMap.get(point.studentId) || {
        merit: 0,
        demerit: 0,
      };
      if (point.type === "MERIT") {
        current.merit += point.score;
      } else {
        current.demerit += point.score;
      }
      studentPointsMap.set(point.studentId, current);
    });

    const studentsWithPoints: StudentWithPoints[] = students
      .map((student) => {
        const pointData = studentPointsMap.get(student.id) || {
          merit: 0,
          demerit: 0,
        };
        return {
          ...student,
          meritPoints: pointData.merit,
          demeritPoints: pointData.demerit,
          totalScore: pointData.merit - pointData.demerit,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);

    setTopStudents(studentsWithPoints);
    setIsLoading(false);
  }, [
    students,
    rollcalls,
    points,
    studentsLoading,
    rollcallsLoading,
    pointsLoading,
  ]);

  return {
    stats,
    topStudents,
    isLoading,
  };
}
