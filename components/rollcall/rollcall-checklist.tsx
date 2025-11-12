"use client";

import { useState } from "react";
import { Save, AlertCircle, Users, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
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
import {
  AttendanceStatusButtons,
  type AttendanceStatus,
} from "@/components/rollcall/attendance-status-buttons";
import { CleaningStatusButtons } from "@/components/rollcall/cleaning-status-buttons";
import type { Student, Rollcall, Room } from "@/lib/types";

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
    if (rc?.status) return rc.status;
    return rc?.present ? "PRESENT" : "ABSENT";
  };

  const filteredStudents = useExternalFilters
    ? students
    : students.filter((student) => {
        const sid = getStudentKey(student);
        const rc = rollcalls.find((r) => r.studentId === sid);
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
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            title="학생이 없습니다"
            description="선택한 조건에 해당하는 학생이 없습니다."
            icon={<Users className="h-12 w-12" />}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>출석 체크리스트 ({filteredStudents.length}명)</CardTitle>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              총 {filteredStudents.length}명
            </div>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full"
              onClick={onRefresh}
              disabled={isLoading || !onRefresh}
              title="새로고침"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 필터 박스 (외부 필터 사용 시 숨김) */}
        {!useExternalFilters && (
          <div className="flex items-center gap-4 mb-4">
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

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
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
                const rollcall = rollcalls.find((r) => r.studentId === sid);
                const rollcallData = getRollcallData(sid);
                const studentWithId = {
                  ...(student as any),
                  id: sid,
                } as Student;

                return (
                  <TableRow key={sid}>
                    <TableCell
                      className="font-medium"
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
                      {room?.name || `호실 ${student.roomNumber}`}
                    </TableCell>
                    <TableCell>
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
                    <TableCell>
                      <AttendanceStatusButtons
                        student={studentWithId}
                        rollcall={rollcall}
                        onStatusChange={handleStatusChange}
                        disabled={rollcallData.saving}
                        className="min-w-[150px] max-w-[180px]"
                      />
                    </TableCell>
                    <TableCell>
                      <CleaningStatusButtons
                        student={studentWithId}
                        rollcall={rollcall}
                        onStatusChange={handleCleaningChange}
                        disabled={rollcallData.saving}
                        className="min-w-[170px] max-w-[200px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="비고 입력..."
                        value={rollcallData.note}
                        onChange={(e) => handleNoteChange(sid, e.target.value)}
                        className="w-40"
                        disabled={rollcallData.saving}
                      />
                    </TableCell>
                    <TableCell>
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
      </CardContent>
    </Card>
  );
}
