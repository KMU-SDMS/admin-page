"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Award } from "lucide-react";
import { toast } from "sonner";
import {
  AttendanceStatusButtons,
  type AttendanceStatus,
} from "@/components/rollcall/attendance-status-buttons";
import type { Room, Student, Rollcall } from "@/lib/types";

interface RoomGridViewProps {
  rooms: Room[];
  students: Student[];
  rollcalls: Rollcall[];
  selectedDate: string;
  onUpdateRollcall: (rollcall: Rollcall) => void;
}

export function RoomGridView({
  rooms,
  students,
  rollcalls,
  selectedDate,
  onUpdateRollcall,
}: RoomGridViewProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [pointType, setPointType] = useState<"MERIT" | "DEMERIT">("MERIT");
  const [pointScore, setPointScore] = useState("");
  const [pointReason, setPointReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 층별로 호실 그룹화
  const roomsByFloor = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) {
      acc[room.floor] = [];
    }
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<number, Room[]>);

  // 호실별 학생 수와 출석 상태 계산
  const getRoomStats = (roomId: number) => {
    const roomStudents = students.filter((s) => s.roomId === roomId);
    const presentCount = roomStudents.filter((s) => {
      const rollcall = rollcalls.find((r) => r.studentId === s.id);
      return rollcall?.present;
    }).length;

    return {
      total: roomStudents.length,
      present: presentCount,
      absent: roomStudents.length - presentCount,
    };
  };

  // 호실 클릭 핸들러
  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setSelectedStudents([]);
    setPointType("MERIT");
    setPointScore("");
    setPointReason("");
  };

  // 학생 선택 토글
  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // 출석 상태 변경
  const handleStatusChange = async (
    studentId: number,
    status: AttendanceStatus
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const present = status === "PRESENT";

    try {
      const rollcallData = {
        studentId: student.id,
        roomId: student.roomId,
        date: selectedDate,
        present,
        status,
        note: "",
      };

      // onUpdateRollcall을 호출하여 상태 업데이트
      await onUpdateRollcall(rollcallData);
      toast.success(`${student.name} 출석 상태가 업데이트되었습니다.`);
    } catch (error) {
      toast.error("출석 상태 업데이트에 실패했습니다.");
    }
  };

  // 상벌점 부여
  const handleSubmitPoints = async () => {
    if (selectedStudents.length === 0 || !pointScore || !pointReason) {
      toast.error("학생, 점수, 사유를 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock 데이터로 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        `${selectedStudents.length}명에게 ${
          pointType === "MERIT" ? "상점" : "벌점"
        }이 부여되었습니다.`
      );
      setSelectedRoom(null);
    } catch (error) {
      toast.error("상벌점 부여에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoomStudents = selectedRoom
    ? students.filter((s) => s.roomId === selectedRoom.id)
    : [];

  // 각 학생의 rollcall 데이터를 메모이제이션
  const getStudentRollcall = useMemo(() => {
    return (studentId: number) => {
      const rollcall = rollcalls.find((r) => r.studentId === studentId);
      return rollcall;
    };
  }, [rollcalls]);

  return (
    <>
      <div className="space-y-6">
        {Object.entries(roomsByFloor)
          .sort(([a], [b]) => Number.parseInt(b) - Number.parseInt(a))
          .map(([floor, floorRooms]) => (
            <div key={floor} className="space-y-3">
              <h3 className="text-responsive-lg font-semibold text-muted-foreground">
                {floor}층
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3">
                {floorRooms
                  .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
                  .map((room) => {
                    const stats = getRoomStats(room.id);
                    const attendanceRate =
                      stats.total > 0 ? (stats.present / stats.total) * 100 : 0;

                    return (
                      <Card
                        key={room.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          attendanceRate === 100
                            ? "bg-green-50 border-green-200 hover:bg-green-100"
                            : attendanceRate > 0
                            ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                            : "bg-red-50 border-red-200 hover:bg-red-100"
                        }`}
                        onClick={() => handleRoomClick(room)}
                      >
                        <CardContent className="p-3 text-center">
                          <div className="font-semibold text-responsive-sm mb-1">
                            {room.name}
                          </div>
                          <div className="flex items-center justify-center gap-1 text-responsive-xs text-muted-foreground mb-2">
                            <Users className="h-3 w-3" />
                            {stats.total}명
                          </div>
                          <div className="space-y-1">
                            <Badge
                              variant={
                                stats.present > 0 ? "default" : "secondary"
                              }
                              className="text-responsive-xs px-1 py-0"
                            >
                              출석 {stats.present}
                            </Badge>
                            {stats.absent > 0 && (
                              <Badge
                                variant="destructive"
                                className="text-responsive-xs px-1 py-0"
                              >
                                결석 {stats.absent}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>

      {/* 호실 상세 모달 */}
      <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedRoom?.name} 관리
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 학생 목록 */}
            <div className="space-y-3">
              <h4 className="font-medium">학생 목록 및 출석 관리</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedRoomStudents.map((student) => {
                  const rollcall = rollcalls.find(
                    (r) => r.studentId === student.id
                  );
                  const isPresent = rollcall?.present || false;

                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() =>
                            toggleStudentSelection(student.id)
                          }
                        />
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-responsive-sm text-muted-foreground">
                              {student.studentIdNum}
                            </div>
                          </div>
                          {(() => {
                            const rollcall = getStudentRollcall(student.id);
                            const currentStatus =
                              rollcall?.status ||
                              (rollcall?.present ? "PRESENT" : "ABSENT");

                            const statusConfig = {
                              PRESENT: {
                                variant: "default" as const,
                                label: "재실",
                              },
                              LEAVE: {
                                variant: "outline" as const,
                                label: "외박",
                              },
                              ABSENT: {
                                variant: "destructive" as const,
                                label: "결석",
                              },
                            };

                            const config =
                              statusConfig[
                                currentStatus as keyof typeof statusConfig
                              ] || statusConfig.PRESENT;

                            return (
                              <Badge variant={config.variant}>
                                {config.label}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <AttendanceStatusButtons
                          student={student}
                          rollcall={getStudentRollcall(student.id)}
                          onStatusChange={handleStatusChange}
                          className="min-w-[180px]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 상벌점 부여 */}
            {selectedStudents.length > 0 && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  선택된 {selectedStudents.length}명에게 상벌점 부여
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>구분</Label>
                    <Select
                      value={pointType}
                      onValueChange={(value: "MERIT" | "DEMERIT") =>
                        setPointType(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MERIT">상점</SelectItem>
                        <SelectItem value="DEMERIT">벌점</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>점수</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="점수 입력"
                      value={pointScore}
                      onChange={(e) => setPointScore(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>사유</Label>
                  <Textarea
                    placeholder="상벌점 부여 사유를 입력하세요"
                    value={pointReason}
                    onChange={(e) => setPointReason(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleSubmitPoints}
                  disabled={isSubmitting || !pointScore || !pointReason}
                  className="w-full"
                >
                  {isSubmitting
                    ? "처리 중..."
                    : `${pointType === "MERIT" ? "상점" : "벌점"} 부여`}
                </Button>
              </div>
            )}

            {/* 저장 및 닫기 버튼 */}
            <div className="flex justify-center pt-4 border-t">
              <Button
                onClick={() => {
                  toast.success("저장되었습니다.", {
                    description: "학생 출석 정보가 저장되었습니다.",
                    duration: 3000,
                  });
                  setSelectedRoom(null);
                }}
                className="px-8"
              >
                저장 및 닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
