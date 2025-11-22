"use client";

import { useState } from "react";
import { Save, AlertCircle, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AttendanceStatus } from "@/components/rollcall/attendance-status-buttons";
import type { Student, Rollcall, Room } from "@/lib/types";

// 출석 상태 드롭다운 컴포넌트
function AttendanceStatusDropdown({
  student,
  rollcall,
  onStatusChange,
  disabled = false,
}: {
  student: Student;
  rollcall?: Rollcall;
  onStatusChange: (studentId: number, status: AttendanceStatus) => void;
  disabled?: boolean;
}) {
  const getAttendanceStatus = (rc?: Rollcall): AttendanceStatus => {
    if (rc?.status) return rc.status;
    return rc?.present ? "PRESENT" : "ABSENT";
  };

  const currentStatus = getAttendanceStatus(rollcall);

  const statusOptions: { value: AttendanceStatus; label: string; color: string }[] = [
    { value: "PRESENT", label: "재실", color: "bg-green-100 text-green-800" },
    { value: "ABSENT", label: "결석", color: "bg-red-100 text-red-800" },
  ];

  const getCurrentStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return "border-green-600 text-green-700 dark:text-green-300 dark:border-green-400";
      case "LEAVE":
        return "border-yellow-600 text-yellow-700 dark:text-yellow-300 dark:border-yellow-400";
      case "ABSENT":
        return "border-red-600 text-red-700 dark:text-red-300 dark:border-red-400";
    }
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => onStatusChange(student.id, value as AttendanceStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        className={`w-[150px] h-8 ${getCurrentStatusColor(currentStatus)}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// 청소 점호 드롭다운 컴포넌트
function CleaningStatusDropdown({
  student,
  rollcall,
  onStatusChange,
  disabled = false,
}: {
  student: Student;
  rollcall?: Rollcall;
  onStatusChange: (studentId: number, status: "PASS" | "FAIL" | "NONE") => void;
  disabled?: boolean;
}) {
  type CleaningStatus = "PASS" | "FAIL" | "NONE";
  
  const currentStatus: CleaningStatus = rollcall?.cleaningStatus ?? "NONE";

  const statusOptions: { value: CleaningStatus; label: string }[] = [
    {
      value: "PASS",
      label: "통과",
    },
    {
      value: "FAIL",
      label: "불통과",
    },
    {
      value: "NONE",
      label: "미실시",
    },
  ];

  const getCurrentStatusColor = (status: CleaningStatus) => {
    switch (status) {
      case "PASS":
        return "border-green-600 text-green-700 dark:text-green-300 dark:border-green-400";
      case "FAIL":
        return "border-red-600 text-red-700 dark:text-red-300 dark:border-red-400";
      case "NONE":
        return "border-slate-600 text-slate-700 dark:text-slate-300 dark:border-slate-400";
    }
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => onStatusChange(student.id, value as CleaningStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        className={`w-[150px] h-8 ${getCurrentStatusColor(currentStatus)}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface RollCallChecklistProps {
  students: Student[];
  rollcalls: Rollcall[];
  rooms: Room[];
  isLoading: boolean;
  onUpdateRollcall: (data: any) => Promise<void>;
  selectedDate: string;
  onRefresh?: () => void;
  useExternalFilters?: boolean;
}

interface RollcallState {
  [studentId: number]: {
    present: boolean;
    cleaningStatus: "PASS" | "FAIL" | "NONE";
    note: string;
    saving: boolean;
    error: string | null;
  };
}

export function RollCallChecklist({
  students,
  rollcalls,
  rooms,
  isLoading,
  onUpdateRollcall,
  selectedDate,
  onRefresh,
  useExternalFilters = false,
}: RollCallChecklistProps) {
  const { toast } = useToast();
  const [rollcallState, setRollcallState] = useState<RollcallState>({});
  const [attendanceFilter, setAttendanceFilter] = useState<
    "all" | "PRESENT" | "LEAVE" | "ABSENT"
  >("all");
  const [cleaningFilter, setCleaningFilter] = useState<
    "all" | "PASS" | "FAIL" | "NONE"
  >("all");

  // 학생 식별자: id가 없으면 학번(숫자)으로 대체
  const getStudentKey = (student: Student): number => {
    const anyStudent = student as unknown as { id?: number };
    if (typeof anyStudent.id === "number") return anyStudent.id;
    const parsed =
      typeof student.studentIdNum === "string"
        ? Number.parseInt(student.studentIdNum, 10)
        : Number(student.studentIdNum);
    return Number.isFinite(parsed) ? parsed : -1;
  };

  const getRollcallData = (studentId: number) => {
    const existing = rollcalls.find((r) => r.studentId === studentId);
    const state = rollcallState[studentId];

    return {
      present: state?.present ?? existing?.present ?? false,
      cleaningStatus:
        state?.cleaningStatus ?? existing?.cleaningStatus ?? "NONE",
      note: state?.note ?? existing?.note ?? "",
      saving: state?.saving ?? false,
      error: state?.error ?? null,
    };
  };

  const updateRollcallState = (
    studentId: number,
    updates: Partial<RollcallState[number]>
  ) => {
    setRollcallState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...updates,
      },
    }));
  };

  const saveRollcall = async (
    student: Student,
    present: boolean,
    note: string,
    status?: AttendanceStatus,
    cleaningStatus?: "PASS" | "FAIL" | "NONE"
  ) => {
    const sid = getStudentKey(student);
    updateRollcallState(sid, { saving: true, error: null });

    try {
      await onUpdateRollcall({
        date: selectedDate,
        studentId: sid,
        roomId: student.roomNumber,
        present,
        status,
        cleaningStatus,
        note: note.trim() || undefined,
      });

      toast({
        title: "저장 완료",
        description: `${student.name} 학생의 출석 정보가 저장되었습니다.`,
      });

      updateRollcallState(sid, { saving: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "저장에 실패했습니다.";
      updateRollcallState(sid, { saving: false, error: errorMessage });

      toast({
        title: "저장 실패",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handlePresentChange = (student: Student, present: boolean) => {
    const sid = getStudentKey(student);
    const currentData = getRollcallData(sid);
    updateRollcallState(sid, { present });
    saveRollcall(student, present, currentData.note);
  };

  const handleStatusChange = async (
    studentId: number,
    status: AttendanceStatus
  ) => {
    const student = students.find(
      (s) =>
        (s as any).id === studentId ||
        Number.parseInt(String(s.studentIdNum), 10) === studentId
    );
    if (!student) return;

    const present = status === "PRESENT";
    updateRollcallState(studentId, { present });
    await saveRollcall(student, present, "", status);
  };

  const handleCleaningChange = async (
    studentId: number,
    cleaningStatus: "PASS" | "FAIL" | "NONE"
  ) => {
    const student = students.find(
      (s) =>
        (s as any).id === studentId ||
        Number.parseInt(String(s.studentIdNum), 10) === studentId
    );
    if (!student) return;

    const currentData = getRollcallData(studentId);
    updateRollcallState(studentId, { cleaningStatus });
    await saveRollcall(
      student,
      currentData.present,
      currentData.note,
      undefined,
      cleaningStatus
    );
  };

  const handleNoteChange = (studentId: number, note: string) => {
    updateRollcallState(studentId, { note });
  };

  const handleNoteSave = (student: Student) => {
    const currentData = getRollcallData(getStudentKey(student));
    saveRollcall(student, currentData.present, currentData.note);
  };

  const getAttendanceStatus = (rc?: Rollcall): AttendanceStatus => {
    if (rc?.present !== undefined) {
      return rc.present ? "PRESENT" : "ABSENT";
    }
    return rc?.status ?? "ABSENT";
  };

  const filteredStudents = useExternalFilters
    ? students
    : students.filter((student) => {
        const sid = getStudentKey(student);
        const rc = rollcalls.find((r) => String(r.studentId) === String(sid));
        const attendance = getAttendanceStatus(rc);
        const cleaning = rc?.cleaningStatus ?? "NONE";

        const attendanceOk =
          attendanceFilter === "all" ? true : attendance === attendanceFilter;
        const cleaningOk =
          cleaningFilter === "all" ? true : cleaning === cleaningFilter;

        return attendanceOk && cleaningOk;
      });

  const getStatusBadge = (status: Student["status"]) => {
    const variants = {
      IN: { variant: "default" as const, label: "재실" },
      OUT: { variant: "secondary" as const, label: "외출" },
      LEAVE: { variant: "outline" as const, label: "외박" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div>
        <EmptyState
          title="학생이 없습니다"
          description="선택한 조건에 해당하는 학생이 없습니다."
          icon={<Users className="h-12 w-12" />}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* 필터 박스 (외부 필터 사용 시 숨김) */}
      {!useExternalFilters && (
        <div className="flex items-center gap-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">참석</span>
            <Select
              value={attendanceFilter}
              onValueChange={(v) =>
                setAttendanceFilter(
                  v as "all" | "PRESENT" | "LEAVE" | "ABSENT"
                )
              }
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="PRESENT">참석</SelectItem>
                <SelectItem value="LEAVE">외박</SelectItem>
                <SelectItem value="ABSENT">결석</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">청소</span>
            <Select
              value={cleaningFilter}
              onValueChange={(v) =>
                setCleaningFilter(v as "all" | "PASS" | "FAIL" | "NONE")
              }
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="PASS">통과</SelectItem>
                <SelectItem value="FAIL">불통과</SelectItem>
                <SelectItem value="NONE">미실시</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="rounded-md border flex-1 overflow-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead
                className="px-4 py-3"
                style={{
                  fontSize: "var(--typography-label-1-normal-bold-fontSize)",
                  fontWeight:
                    "var(--typography-label-1-normal-bold-fontWeight)",
                  lineHeight:
                    "var(--typography-label-1-normal-bold-lineHeight)",
                  letterSpacing:
                    "var(--typography-label-1-normal-bold-letterSpacing)",
                }}
              >
                학생명
              </TableHead>
              <TableHead
                className="px-4 py-3"
                style={{
                  fontSize: "var(--typography-label-1-normal-bold-fontSize)",
                  fontWeight:
                    "var(--typography-label-1-normal-bold-fontWeight)",
                  lineHeight:
                    "var(--typography-label-1-normal-bold-lineHeight)",
                  letterSpacing:
                    "var(--typography-label-1-normal-bold-letterSpacing)",
                }}
              >
                호실
              </TableHead>
              <TableHead
                className="px-4 py-3"
                style={{
                  fontSize: "var(--typography-label-1-normal-bold-fontSize)",
                  fontWeight:
                    "var(--typography-label-1-normal-bold-fontWeight)",
                  lineHeight:
                    "var(--typography-label-1-normal-bold-lineHeight)",
                  letterSpacing:
                    "var(--typography-label-1-normal-bold-letterSpacing)",
                }}
              >
                상태
              </TableHead>
              <TableHead
                className="px-4 py-3"
                style={{
                  fontSize: "var(--typography-label-1-normal-bold-fontSize)",
                  fontWeight:
                    "var(--typography-label-1-normal-bold-fontWeight)",
                  lineHeight:
                    "var(--typography-label-1-normal-bold-lineHeight)",
                  letterSpacing:
                    "var(--typography-label-1-normal-bold-letterSpacing)",
                }}
              >
                출석 상태 변경
              </TableHead>
              <TableHead
                className="px-4 py-3"
                style={{
                  fontSize: "var(--typography-label-1-normal-bold-fontSize)",
                  fontWeight:
                    "var(--typography-label-1-normal-bold-fontWeight)",
                  lineHeight:
                    "var(--typography-label-1-normal-bold-lineHeight)",
                  letterSpacing:
                    "var(--typography-label-1-normal-bold-letterSpacing)",
                }}
              >
                청소 점호
              </TableHead>
              <TableHead
                className="px-4 py-3"
                style={{
                  fontSize: "var(--typography-label-1-normal-bold-fontSize)",
                  fontWeight:
                    "var(--typography-label-1-normal-bold-fontWeight)",
                  lineHeight:
                    "var(--typography-label-1-normal-bold-lineHeight)",
                  letterSpacing:
                    "var(--typography-label-1-normal-bold-letterSpacing)",
                }}
              >
                비고
              </TableHead>
              <TableHead
                className="px-4 py-3"
                style={{
                  fontSize: "var(--typography-label-1-normal-bold-fontSize)",
                  fontWeight:
                    "var(--typography-label-1-normal-bold-fontWeight)",
                  lineHeight:
                    "var(--typography-label-1-normal-bold-lineHeight)",
                  letterSpacing:
                    "var(--typography-label-1-normal-bold-letterSpacing)",
                }}
              >
                저장
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
              const room = rooms.find((r) => r.id === student.roomNumber);
              const sid = getStudentKey(student);
              const rollcall = rollcalls.find(
    (r) => String(r.studentId) === String(getStudentKey(student))
  );            const rollcallData = getRollcallData(sid);
              const studentWithId = {
                ...(student as any),
                id: sid,
              } as Student;

              return (
                <TableRow key={sid}>
                  <TableCell
                    className="font-medium px-4 py-3"
                    style={{
                      fontSize:
                        "var(--typography-body-2-reading-bold-fontSize)",
                      fontWeight:
                        "var(--typography-body-2-reading-bold-fontWeight)",
                      lineHeight:
                        "var(--typography-body-2-reading-bold-lineHeight)",
                      letterSpacing:
                        "var(--typography-body-2-reading-bold-letterSpacing)",
                    }}
                  >
                    {student.name}
                  </TableCell>
                  <TableCell
                    className="px-4 py-3"
                    style={{
                      fontSize:
                        "var(--typography-label-2-normal-medium-fontSize)",
                      fontWeight:
                        "var(--typography-label-2-normal-medium-fontWeight)",
                      lineHeight:
                        "var(--typography-label-2-normal-medium-lineHeight)",
                      letterSpacing:
                        "var(--typography-label-2-normal-medium-letterSpacing)",
                    }}
                  >
                    {room?.name || `${student.roomNumber}호`}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {(() => {
                      const currentStatus = getAttendanceStatus(rollcall);
                      const config =
                        currentStatus === "PRESENT"
                          ? { label: "참석", variant: "default" as const }
                          : currentStatus === "LEAVE"
                          ? { label: "외박", variant: "outline" as const }
                          : {
                              label: "결석",
                              variant: "destructive" as const,
                            };
                      return (
                        <Badge variant={config.variant}>{config.label}</Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <AttendanceStatusDropdown
                      student={studentWithId}
                      rollcall={rollcall}
                      onStatusChange={handleStatusChange}
                      disabled={rollcallData.saving}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <CleaningStatusDropdown
                      student={studentWithId}
                      rollcall={rollcall}
                      onStatusChange={handleCleaningChange}
                      disabled={rollcallData.saving}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Input
                      placeholder="비고 입력..."
                      value={rollcallData.note}
                      onChange={(e) => handleNoteChange(sid, e.target.value)}
                      className="w-40"
                      disabled={rollcallData.saving}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {rollcallData.saving ? (
                        <LoadingSpinner size="sm" />
                      ) : rollcallData.error ? (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNoteSave(student)}
                          >
                            재시도
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNoteSave(student)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
