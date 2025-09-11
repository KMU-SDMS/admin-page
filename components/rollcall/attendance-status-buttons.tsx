"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Student, Rollcall } from "@/lib/types";

export type AttendanceStatus = "PRESENT" | "LEAVE" | "ABSENT";

interface AttendanceStatusButtonsProps {
  student: Student;
  rollcall?: Rollcall;
  onStatusChange: (studentId: number, status: AttendanceStatus) => void;
  disabled?: boolean;
  className?: string;
}

const statusConfig = {
  PRESENT: {
    label: "재실",
    variant: "default" as const,
    className:
      "bg-transparent hover:bg-green-50 text-green-600 border-green-500",
    selectedClassName:
      "!bg-gradient-to-br !from-green-50/5 !to-green-50/10 !text-green-700 !font-bold !shadow-md !ring-2 !ring-green-300/40 !border-green-600/80",
  },
  LEAVE: {
    label: "외박",
    variant: "outline" as const,
    className:
      "bg-transparent hover:bg-yellow-50 text-yellow-600 border-yellow-500",
    selectedClassName:
      "!bg-gradient-to-br !from-yellow-50/5 !to-yellow-50/10 !text-yellow-700 !font-bold !shadow-md !ring-2 !ring-yellow-300/40 !border-yellow-600/80",
  },
  ABSENT: {
    label: "결석",
    variant: "destructive" as const,
    className: "bg-transparent hover:bg-red-50 text-red-600 border-red-500",
    selectedClassName:
      "!bg-gradient-to-br !from-red-50/5 !to-red-50/10 !text-red-700 !font-bold !shadow-md !ring-2 !ring-red-300/40 !border-red-600/80",
  },
} as const;

export function AttendanceStatusButtons({
  student,
  rollcall,
  onStatusChange,
  disabled = false,
  className,
}: AttendanceStatusButtonsProps) {
  const [isChanging, setIsChanging] = useState(false);

  // 현재 상태 결정: rollcall의 status가 있으면 사용, 없으면 present 기반으로 추론
  const currentStatus = useMemo((): AttendanceStatus => {
    console.log("AttendanceStatusButtons currentStatus 계산:", {
      rollcall,
      studentId: student.id,
    });
    if (rollcall?.status) {
      return rollcall.status;
    }
    // 기존 present 필드 기반으로 추론
    return rollcall?.present ? "PRESENT" : "ABSENT";
  }, [rollcall, student.id]);

  const handleStatusChange = async (status: AttendanceStatus) => {
    if (disabled || isChanging || status === currentStatus) return;

    setIsChanging(true);
    try {
      onStatusChange(student.id, status);
    } finally {
      setIsChanging(false);
    }
  };

  console.log("AttendanceStatusButtons 렌더링:", {
    currentStatus,
    studentId: student.id,
    rollcall,
  });

  return (
    <div className={cn("flex gap-1", className)}>
      {Object.entries(statusConfig).map(([status, config]) => {
        const statusKey = status as AttendanceStatus;
        const isSelected = currentStatus === statusKey;
        console.log(
          `버튼 ${status} (${statusKey}) isSelected:`,
          isSelected,
          "currentStatus:",
          currentStatus
        );
        return (
          <button
            key={status}
            type="button"
            className={cn(
              "flex-1 text-xs px-2 py-1 h-8 transition-all duration-200 rounded-md border font-medium",
              config.className,
              isSelected && config.selectedClassName,
              disabled && "opacity-50 cursor-not-allowed",
              isChanging && "opacity-70 cursor-wait",
              !isSelected && "hover:opacity-80"
            )}
            onClick={() => handleStatusChange(statusKey)}
            disabled={disabled || isChanging}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
