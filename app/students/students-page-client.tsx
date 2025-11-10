"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Plus, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StudentListTable } from "@/components/students/student-list-table";
import {
  StudentFormModal,
  StudentFormData,
} from "@/components/students/student-form-modal";
import { StudentRoomListModal } from "@/components/students/student-room-list-modal";
import { StudentNotifyModal } from "@/components/students/student-notify-modal";
import { useStudents } from "@/hooks/use-students";
import { toast as sonnerToast } from "sonner";
import { Student } from "@/lib/types";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface StudentsPageClientProps {
  initialStudents: Student[];
}

export function StudentsPageClient({
  initialStudents,
}: StudentsPageClientProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  // filters (reusing Notices UX pattern)
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState<number | null>(null);
  const [listMode, setListMode] = useState<"all" | "byRoom">("all");
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch((prev) => {
        const nextValue = searchTerm.trim();
        return prev === nextValue ? prev : nextValue;
      });
    }, 400);
    return () => window.clearTimeout(handler);
  }, [searchTerm]);

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useStudents({
    roomNumber:
      listMode === "byRoom" && roomFilter !== null ? roomFilter : undefined,
    name: debouncedSearch || undefined,
  });

  const baseDataset = students.length > 0 ? students : initialStudents;

  const availableRooms = useMemo(() => {
    const set = new Set<number>();
    baseDataset.forEach((s) => {
      if (typeof s.roomNumber === "number") set.add(s.roomNumber);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [baseDataset]);

  const displayStudents = baseDataset;
  const totalItems = listMode === "byRoom" ? availableRooms.length : displayStudents.length;

  const handleAddStudent = () => {
    setModalMode("create");
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setModalMode("edit");
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSubmitStudent = async (data: StudentFormData) => {
    try {
      if (modalMode === "create") {
        await api.students.create(data);
        toast({
          title: "추가 완료",
          description: `${data.name} 학생이 추가되었습니다.`,
        });
      } else {
        await api.students.update(data);
        toast({
          title: "수정 완료",
          description: `${data.name} 학생 정보가 수정되었습니다.`,
        });
      }
      await refetchStudents();
      handleCloseModal();
    } catch (error) {
      toast({
        title: modalMode === "create" ? "추가 실패" : "수정 실패",
        description:
          error instanceof Error
            ? error.message
            : `학생 ${modalMode === "create" ? "추가" : "수정"}에 실패했습니다.`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (isDeleting) return;
    if (!confirm(`${student.name} 학생을 삭제하시겠습니까?`)) return;

    setIsDeleting(true);
    try {
      await api.students.delete(student.studentIdNum);
      toast({
        title: "삭제 완료",
        description: `${student.name} 학생이 삭제되었습니다.`,
      });
      await refetchStudents();
    } catch (error) {
      toast({
        title: "삭제 실패",
        description:
          error instanceof Error ? error.message : "학생 삭제에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchStudents();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendNotification = async (payload: { studentNos: string[]; title: string; content: string }) => {
    // API: POST /api/notifications/individual for each student
    const results = await Promise.allSettled(
      payload.studentNos.map((no) =>
        api.post("/api/notifications/individual", {
          student_no: no,
          title: payload.title,
          content: payload.content,
        })
      )
    );
    const success = results.filter((r) => r.status === "fulfilled").length;
    const fail = results.length - success;
    toast({
      title: "알림 전송 결과",
      description: `성공: ${success}건, 실패: ${fail}건`,
      variant: fail > 0 ? "destructive" : "default",
    });
    // 보조로 sonner 토스트도 노출 (환경에 따라 훅 미표시 문제 대응)
    if (fail > 0) {
      sonnerToast.error(`알림 전송 일부 실패 - 성공 ${success}건, 실패 ${fail}건`);
    } else {
      sonnerToast.success(`알림 전송 완료 - 총 ${success}건`);
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--color-background-normal-alternative)" }}
    >
      {/* Search Box Area (reuse Notices style) */}
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
          학생 관리
        </h1>
        <div className="flex items-center gap-2 w-[614px] h-[48px] ml-[161px]">
          <Input
            placeholder="이름, 학번 검색"
            className="flex-1 h-full"
            style={{
              backgroundColor: "var(--color-fill-alternative)",
              color: "var(--color-label-alternative)",
            }}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {/* Main Content (Left filter + table) */}
      <div className="flex flex-col lg:flex-row gap-20 flex-1 min-h-0 px-20 pb-[30px] pt-4">
        {/* Left Sidebar Container */}
        <div className="w-[176px] flex-shrink-0">
          {/* Create Button */}
          <Button
            onClick={handleAddStudent}
            className="w-[131px] h-[48px]"
            style={{
              backgroundColor: "var(--color-semantic-primary-normal)",
              color: "var(--color-semantic-static-white)",
              border: "1px solid var(--color-semantic-line-normal-normal)",
              fontSize: "var(--typography-headline-2-bold-fontSize)",
              fontWeight: "var(--typography-headline-2-bold-fontWeight)",
              lineHeight: "var(--typography-headline-2-bold-lineHeight)",
              letterSpacing: "var(--typography-headline-2-bold-letterSpacing)",
            }}
          >
            학생 추가
            <Plus className="h-4 w-4 mr-2" style={{ color: "var(--color-semantic-static-white)" }} />
          </Button>

          {/* Total Count with Refresh Button */}
          <div className="flex items-center gap-[10px] mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-[32px] w-[32px] rounded-full flex-shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <div
              style={{
                color: "var(--color-label-normal)",
                fontSize: "var(--typography-body-1-normal-bold-fontSize)",
                fontWeight: "var(--typography-body-1-normal-bold-fontWeight)",
                lineHeight: "var(--typography-body-1-normal-bold-lineHeight)",
                letterSpacing: "var(--typography-body-1-normal-bold-letterSpacing)",
              }}
            >
              총 {totalItems}건
            </div>
          </div>

          {/* Filters Card */}
          <Card className="w-[176px] h-[616px] mt-4 bg-transparent border-none shadow-none">
            <CardContent className="px-4 space-y-6 overflow-y-auto h-full">
              {/* Mode Selection */}
              <div className="space-y-3">
                <Label className="text-[14px] font-bold leading-[20.006px] tracking-[0.203px]">
                  목록 유형
                </Label>
                <RadioGroup
                  value={listMode}
                  onValueChange={(val) => {
                    if (val === "all" || val === "byRoom") {
                      setListMode(val);
                      setRoomFilter(null);
                      setSelectedRoom(null);
                    }
                  }}
                  className="gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="mode-all" value="all" />
                    <Label
                      htmlFor="mode-all"
                      className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                    >
                      전체 학생 목록
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="mode-byroom" value="byRoom" />
                    <Label
                      htmlFor="mode-byroom"
                      className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                    >
                      호실별 학생 목록
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              {/* 호실 필터 섹션 제거 (byRoom은 메인 영역에서 카드로 표시) */}
            </CardContent>
          </Card>
        </div>

        {/* Main Table Area */}
        <Card className="flex-1 flex flex-col min-h-0 w-[1187px] h-[938px]">
          <CardContent className="px-4 py-0 flex flex-col flex-1 min-h-0 overflow-hidden">
            {listMode === "byRoom" ? (
              <div className="overflow-auto flex-1 p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {availableRooms.map((room) => {
                    const count = baseDataset.filter((s) => s.roomNumber === room).length;
                    return (
                      <button
                        key={room}
                        onClick={() => {
                          setSelectedRoom(room);
                          setRoomModalOpen(true);
                        }}
                        className="text-left rounded-lg border p-4 hover:shadow transition-shadow bg-white"
                        style={{ borderColor: "var(--color-line-normal-neutral)" }}
                      >
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            lineHeight: "24px",
                            letterSpacing: "0.144px",
                            color: "#16161d",
                          }}
                        >
                          {room}호
                        </div>
                        <div
                          className="text-muted-foreground"
                          style={{
                            fontSize: "12px",
                            fontWeight: 500,
                            lineHeight: "16.008px",
                            letterSpacing: "0.302px",
                          }}
                        >
                          학생 {count}명
                        </div>
                      </button>
                    );
                  })}
                  {availableRooms.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                      표시할 호실이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-auto flex-1">
                <StudentListTable
                  students={displayStudents}
                  isLoading={studentsLoading}
                  error={studentsError}
                  onEdit={handleEditStudent}
                  onDelete={handleDeleteStudent}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Notify Button */}
      <button
        type="button"
        onClick={() => setNotifyOpen(true)}
        className="fixed z-40 shadow-lg hover:shadow-xl transition-shadow"
        style={{
          width: 100,
          height: 100,
          right: 150,
          bottom: 150,
          borderRadius: 9999,
          backgroundColor: "var(--color-semantic-primary-normal)",
          color: "var(--color-semantic-static-white)",
        }}
        aria-label="알림 전송"
        title="알림 전송"
      >
        <MessageSquare className="w-7 h-7 mx-auto" />
      </button>

      {/* Student Form Modal */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitStudent}
        student={selectedStudent}
        mode={modalMode}
      />

      {/* Room Students Modal */}
      <StudentRoomListModal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        roomNumber={selectedRoom}
        students={
          selectedRoom === null
            ? []
            : baseDataset.filter((s) => s.roomNumber === selectedRoom)
        }
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
      />

      {/* Notify Modal */}
      <StudentNotifyModal
        isOpen={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        students={baseDataset}
        onSend={handleSendNotification}
      />
    </div>
  );
}
