"use client";

import { useState, useMemo } from "react";
import { Users as UsersIcon, Award, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRooms } from "@/hooks/use-rooms";
import { useStudents } from "@/hooks/use-students";
import { useRollcalls } from "@/hooks/use-rollcalls";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RollCallChecklist } from "@/components/rollcall/rollcall-checklist";
import { RoomGridView } from "@/components/rollcall/room-grid-view";
import type { Rollcall } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-viewport";
import type { AttendanceStatus } from "@/components/rollcall/attendance-status-buttons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function RollCallPageClient() {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string>("all");
  const [nameSearch, setNameSearch] = useState("");
  const [unconfirmedOnly, setUnconfirmedOnly] = useState(false);
  const [mobileTab, setMobileTab] = useState<"student" | "room">("student");
  const [desktopTab, setDesktopTab] = useState<"student" | "room">("student");

  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const {
    data: students,
    isLoading: studentsLoading,
    refetch: refetchStudents,
  } = useStudents({
    roomNumber:
      selectedRoomId === "all" ? undefined : Number.parseInt(selectedRoomId),
    name: nameSearch || undefined,
  });

  // 점호 API 호출
  const {
    data: rollcalls,
    isLoading: rollcallsLoading,
    refetch: refetchRollcalls,
    mutate: mutateRollcall,
  } = useRollcalls({
    date: selectedDate,
    roomId: selectedRoomId === "all" ? undefined : Number.parseInt(selectedRoomId),
    name: nameSearch || undefined,
  });

  // ...



  // 공지사항 레이아웃 필터 및 로컬 점호 상태
  const [attendanceFilter, setAttendanceFilter] = useState<
    "all" | "PRESENT" | "ABSENT"
  >("all");
  const [cleaningFilter, setCleaningFilter] = useState<
    "all" | "PASS" | "FAIL" | "NONE"
  >("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getAttendanceStatus = (rc?: Rollcall) => {
    if (rc?.status) return rc.status;
    return rc?.present ? "PRESENT" : "ABSENT";
  };

  // 학생 식별자: id가 없으면 학번(숫자)으로 대체
  const getStudentKey = (student: any): number => {
    const anyStudent = student as unknown as { id?: number };
    if (typeof anyStudent.id === "number") return anyStudent.id;
    const parsed =
      typeof student.studentIdNum === "string"
        ? Number.parseInt(student.studentIdNum, 10)
        : Number(student.studentIdNum);
    return Number.isFinite(parsed) ? parsed : -1;
  };

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    const byUnconfirmed = unconfirmedOnly
      ? students.filter((student) => {
          const sid = getStudentKey(student);
          const rc = rollcalls.find((r) => r.studentId === sid);
          return !rc || !rc.present;
        })
      : students;

    const byName = nameSearch
      ? byUnconfirmed.filter((s) =>
          s.name.toLowerCase().includes(nameSearch.toLowerCase())
        )
      : byUnconfirmed;

    const byAttendance =
      attendanceFilter === "all"
        ? byName
        : byName.filter((s) => {
            const sid = getStudentKey(s);
            const rc = rollcalls.find((r) => r.studentId === sid);
            return getAttendanceStatus(rc) === attendanceFilter;
          });

    const byCleaning =
      cleaningFilter === "all"
        ? byAttendance
        : byAttendance.filter((s) => {
            const sid = getStudentKey(s);
            const rc = rollcalls.find((r) => r.studentId === sid);
            return (rc?.cleaningStatus ?? "NONE") === cleaningFilter;
          });

    // 호실별로 정렬 (같은 호실 내에서는 이름순)
    return byCleaning.sort((a, b) => {
      if (a.roomNumber !== b.roomNumber) {
        return a.roomNumber - b.roomNumber;
      }
      return a.name.localeCompare(b.name, "ko");
    });
  }, [
    students,
    rollcalls,
    unconfirmedOnly,
    nameSearch,
    attendanceFilter,
    cleaningFilter,
  ]);

  // 호실별 필터링된 호실 목록 계산
  const filteredRooms = useMemo(() => {
    if (!rooms || !students || !rollcalls) return [];
    return rooms.filter((room) => {
      const roomStudents = students.filter((s) => s.roomNumber === room.id);
      
      // 참석 상태 필터
      if (attendanceFilter !== "all") {
        const hasMatchingAttendance = roomStudents.some((student) => {
          const sid = getStudentKey(student);
          const rc = rollcalls.find((r) => String(r.studentId) === String(sid));
          const status = rc?.status ?? (rc?.present ? "PRESENT" : "ABSENT");
          return status === attendanceFilter;
        });
        if (!hasMatchingAttendance) return false;
      }

      // 청소 점호 필터
      if (cleaningFilter !== "all") {
        const hasMatchingCleaning = roomStudents.some((student) => {
          const sid = getStudentKey(student);
          const rc = rollcalls.find((r) => String(r.studentId) === String(sid));
          return (rc?.cleaningStatus ?? "NONE") === cleaningFilter;
        });
        if (!hasMatchingCleaning) return false;
      }

      return true;
    });
  }, [rooms, students, rollcalls, attendanceFilter, cleaningFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([refetchStudents(), refetchRollcalls()])
      .finally(() => setIsRefreshing(false));
  };

  // 점호 API 연결: mutate 함수 사용
  const mutateRollcallLocal = async (
    data: Partial<Rollcall> & {
      date: string;
      studentId: number | string;
      present: boolean;
      status?: "PRESENT" | "ABSENT";
      cleaningStatus?: "PASS" | "FAIL" | "NONE";
      note?: string;
    }
  ) => {
    const student = students.find(
      (s) => String(getStudentKey(s)) === String(data.studentId)
    );
    
    await mutateRollcall({
      ...data,
      studentId: String(data.studentId) as any,
      roomId: student?.roomNumber ?? 0,
    });
  };

  // xs 전용 모바일 레이아웃
  if (isMobile) {
    const selectedDateObj = new Date(selectedDate);
    
    return (
      <div className="flex flex-col h-full bg-white sm:hidden">
        {/* 상단 타이틀 + 검색 */}
        <div
          className="pb-3"
          style={{ paddingTop: 30, paddingLeft: 30, paddingRight: 16 }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight">점호</h1>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 px-3 text-sm font-medium",
                    "justify-start text-left"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDateObj, "yyyy-MM-dd")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDateObj}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date.toISOString().split("T")[0]);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="mt-4">
            <Input
              placeholder="학생 이름 검색"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        {/* 탭 (학생별 / 호실별) - 관리비 모바일 탭 스타일 유사 */}
        <div className="px-5">
          <div className="flex items-center gap-6">
            <button
              className="text-base font-semibold relative"
              onClick={() => setMobileTab("student")}
              style={{ color: mobileTab === "student" ? "#000" : "#d1d5db" }}
            >
              학생별
              {mobileTab === "student" && (
                <span className="absolute left-0 -bottom-2 block h-[2px] w-full bg-black" />
              )}
            </button>
            <button
              className="text-base font-semibold relative"
              onClick={() => setMobileTab("room")}
              style={{ color: mobileTab === "room" ? "#000" : "#d1d5db" }}
            >
              호실별
              {mobileTab === "room" && (
                <span className="absolute left-0 -bottom-2 block h-[2px] w-[56px] bg-black" />
              )}
            </button>
          </div>
        </div>

        {/* 필터 드롭다운 */}
        {mobileTab === "student" && (
          <div className="px-5 mt-5">
            <div className="flex items-center gap-2">
              <Select
                value={attendanceFilter}
                onValueChange={(value) =>
                  setAttendanceFilter(
                    value as "all" | "PRESENT" | "ABSENT"
                  )
                }
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="참석 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">점호 전체</SelectItem>
                  <SelectItem value="PRESENT">참석</SelectItem>
                  <SelectItem value="ABSENT">결석</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={cleaningFilter}
                onValueChange={(value) =>
                  setCleaningFilter(value as "all" | "PASS" | "FAIL" | "NONE")
                }
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="청소 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">청소 전체</SelectItem>
                  <SelectItem value="PASS">통과</SelectItem>
                  <SelectItem value="FAIL">불통과</SelectItem>
                  <SelectItem value="NONE">미실시</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="flex-1 min-h-0 mt-4 px-5 pb-[94px]">
          {mobileTab === "student" ? (
            <div className="space-y-3">
              {studentsLoading ? (
                <div className="text-center text-sm text-muted-foreground py-10">
                  로딩 중...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-10">
                  학생이 없습니다
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const anyStudent = student as any;
                  const sid =
                    typeof anyStudent.id === "number"
                      ? anyStudent.id
                      : Number.parseInt(String(student.studentIdNum), 10);
                  const rollcall = rollcalls.find(
                    (r) => r.studentId === sid
                  );
                  const currentStatus: AttendanceStatus =
                    (rollcall?.status as AttendanceStatus) ??
                    (rollcall?.present ? "PRESENT" : "ABSENT");

                  const handleAttendanceChange = async (
                    status: AttendanceStatus
                  ) => {
                    await mutateRollcallLocal({
                      date: selectedDate,
                      studentId: sid,
                      roomId: student.roomNumber,
                      present: status === "PRESENT",
                      status,
                    });
                  };

                  const handleCleaningChange = async (
                    _studentId: number,
                    cleaningStatus: "PASS" | "FAIL" | "NONE"
                  ) => {
                    await mutateRollcallLocal({
                      date: selectedDate,
                      studentId: String(sid), // Convert to string
                      roomId: student.roomNumber,
                      present: currentStatus === "PRESENT",
                      status: currentStatus,
                      cleaningStatus,
                    });
                  };

                  const currentCleaningStatus =
                    rollcall?.cleaningStatus ?? "NONE";

                  return (
                    <div
                      key={sid}
                      className="rounded-xl border p-4 flex flex-col gap-3"
                      style={{ borderColor: "#e5e7eb" }}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="text-base font-semibold">
                          {student.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.roomNumber}호
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={currentStatus}
                          onValueChange={(value) =>
                            handleAttendanceChange(value as AttendanceStatus)
                          }
                        >
                          <SelectTrigger className="h-9 flex-1">
                            <SelectValue placeholder="출석 상태" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRESENT">재실</SelectItem>
                            <SelectItem value="ABSENT">결석</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={currentCleaningStatus}
                          onValueChange={(value) =>
                            handleCleaningChange(
                              sid,
                              value as "PASS" | "FAIL" | "NONE"
                            )
                          }
                        >
                          <SelectTrigger className="h-9 flex-1">
                            <SelectValue placeholder="청소 상태" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PASS">통과</SelectItem>
                            <SelectItem value="FAIL">불통과</SelectItem>
                            <SelectItem value="NONE">미실시</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <RoomGridView
              rooms={rooms}
              students={students}
              rollcalls={rollcalls}
              selectedDate={selectedDate}
              onUpdateRollcall={mutateRollcallLocal}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="spacing-normal viewport-fill">
      <div
        className="flex flex-col h-full viewport-fill-content"
        style={{
          backgroundColor: "var(--color-background-normal-alternative)",
        }}
      >
        <div className="flex items-center px-20 pt-[48px]">
          <h1
            style={{
              color: "var(--color-label-normal)",
              fontSize: "var(--typography-title-2-bold-fontSize)",
              fontWeight: "var(--typography-title-2-bold-fontWeight)",
              lineHeight: "var(--typography-title-2-bold-lineHeight)",
              letterSpacing: "var(--typography-title-2-bold-letterSpacing)",
            }}
          >
            점호 관리
          </h1>
          {desktopTab === "student" && (
            <div className="flex items-center gap-2 w-[614px] h-[48px] ml-[161px]">
              <Input
                placeholder="학생 이름 검색"
                className="flex-1 h-full"
                style={{
                  backgroundColor: "var(--color-fill-alternative)",
                  color: "var(--color-label-alternative)",
                }}
                value={nameSearch}
                onChange={(event) => setNameSearch(event.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-20 flex-1 min-h-0 px-20 pb-[30px] pt-4">
          <div className="w-[176px] flex-shrink-0">
            <div className="flex items-center gap-[10px]">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-[32px] w-[32px] rounded-full flex-shrink-0"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <div
                style={{
                  color: "var(--color-label-normal)",
                  fontSize: "var(--typography-body-1-normal-bold-fontSize)",
                  fontWeight:
                    "var(--typography-body-1-normal-bold-fontWeight)",
                  lineHeight:
                    "var(--typography-body-1-normal-bold-lineHeight)",
                  letterSpacing:
                    "var(--typography-body-1-normal-bold-letterSpacing)",
                }}
              >
                {desktopTab === "student"
                  ? `총 ${filteredStudents.length}명`
                  : `총 ${filteredRooms.length}개 호실`}
              </div>
            </div>

            <Card className="w-[176px] mt-4 bg-transparent border-none shadow-none">
              <CardContent className="px-4 space-y-6 overflow-y-auto">
                {/* 학생별/호실별 탭 */}
                <div className="space-y-2">
                  <Label className="text-[14px] font-bold leading-[20.006px] tracking-[0.203px]">
                    보기 방식
                  </Label>
                  <div className="flex gap-1 p-1 bg-muted rounded-md">
                    <button
                      onClick={() => setDesktopTab("student")}
                      className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                        desktopTab === "student"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      학생별
                    </button>
                    <button
                      onClick={() => setDesktopTab("room")}
                      className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                        desktopTab === "room"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      호실별
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[14px] font-bold leading-[20.006px] tracking-[0.203px]">
                    참석 상태
                  </Label>
                  <Select
                    value={attendanceFilter}
                    onValueChange={(v) =>
                      setAttendanceFilter(
                        v as "all" | "PRESENT" | "ABSENT"
                      )
                    }
                  >
                    <SelectTrigger className="h-[32px]">
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="PRESENT">참석</SelectItem>
                      <SelectItem value="ABSENT">결석</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[14px] font-bold leading-[20.006px] tracking-[0.203px]">
                    청소 점호
                  </Label>
                  <Select
                    value={cleaningFilter}
                    onValueChange={(v) =>
                      setCleaningFilter(v as "all" | "PASS" | "FAIL" | "NONE")
                    }
                  >
                    <SelectTrigger className="h-[32px]">
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
              </CardContent>
            </Card>
          </div>

          <div className="w-[1187px] h-[938px] overflow-hidden">
            {desktopTab === "student" ? (
              <RollCallChecklist
                students={filteredStudents}
                rollcalls={rollcalls}
                rooms={rooms}
                isLoading={studentsLoading}
                onUpdateRollcall={mutateRollcallLocal}
                selectedDate={selectedDate}
                onRefresh={handleRefresh}
                useExternalFilters
              />
            ) : (
              <RoomGridView
                rooms={filteredRooms}
                students={students}
                rollcalls={rollcalls}
                selectedDate={selectedDate}
                onUpdateRollcall={mutateRollcallLocal}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
