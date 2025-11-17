"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Student, Rollcall } from "@/lib/types";

type CleaningStatus = "PASS" | "FAIL" | "NONE";

interface CleaningStatusButtonsProps {
  student: Student;
  rollcall?: Rollcall;
  onStatusChange: (studentId: number, status: CleaningStatus) => void;
  disabled?: boolean;
  className?: string;
}

const statusConfig = {
  PASS: {
    label: "통과",
    className:
      "bg-transparent hover:bg-green-50 text-green-600 border-green-500 dark:hover:bg-green-950 dark:text-green-400 dark:border-green-400",
    selectedClassName:
      "!bg-gradient-to-br !from-green-50/5 !to-green-50/10 !text-green-700 !font-bold !shadow-md !ring-2 !ring-green-300/40 !border-green-600/80 dark:!from-green-950/20 dark:!to-green-950/30 dark:!text-green-300 dark:!ring-green-400/40 dark:!border-green-400/60",
  },
  FAIL: {
    label: "불통과",
    className:
      "bg-transparent hover:bg-red-50 text-red-600 border-red-500 dark:hover:bg-red-950 dark:text-red-400 dark:border-red-400",
    selectedClassName:
      "!bg-gradient-to-br !from-red-50/5 !to-red-50/10 !text-red-700 !font-bold !shadow-md !ring-2 !ring-red-300/40 !border-red-600/80 dark:!from-red-950/20 dark:!to-red-950/30 dark:!text-red-300 dark:!ring-red-400/40 dark:!border-red-400/60",
  },
  NONE: {
    label: "미실시",
    className:
      "bg-transparent hover:bg-slate-50 text-slate-600 border-slate-500 dark:hover:bg-slate-900 dark:text-slate-300 dark:border-slate-400",
    selectedClassName:
      "!bg-gradient-to-br !from-slate-50/5 !to-slate-50/10 !text-slate-700 !font-bold !shadow-md !ring-2 !ring-slate-300/40 !border-slate-600/80 dark:!from-slate-900/20 dark:!to-slate-900/30 dark:!text-slate-300 dark:!ring-slate-400/40 dark:!border-slate-400/60",
  },
} as const;

export function CleaningStatusButtons({
  student,
  rollcall,
  onStatusChange,
  disabled = false,
  className,
}: CleaningStatusButtonsProps) {
  const [isChanging, setIsChanging] = useState(false);

  const currentStatus = useMemo<CleaningStatus>(() => {
    return rollcall?.cleaningStatus ?? "NONE";
  }, [rollcall, student.id]);

  const handleStatusChange = async (status: CleaningStatus) => {
    if (disabled || isChanging || status === currentStatus) return;
    setIsChanging(true);
    try {
      onStatusChange(student.id, status);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className={cn("flex gap-1", className)}>
      {(Object.keys(statusConfig) as CleaningStatus[]).map((status) => {
        const config = statusConfig[status];
        const isSelected = currentStatus === status;
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
            onClick={() => handleStatusChange(status)}
            disabled={disabled || isChanging}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}


