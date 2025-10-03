"use client";

import { useState, useMemo } from "react";
import { Filter, RefreshCw, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentListTable } from "@/components/students/student-list-table";
import {
  StudentFormModal,
  StudentFormData,
} from "@/components/students/student-form-modal";
import { useStudents } from "@/hooks/use-students";
import { Student } from "@/lib/types";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface StudentsPageClientProps {
  initialStudents: Student[];
}

export function StudentsPageClient({
  initialStudents,
}: StudentsPageClientProps) {
  const [nameSearch, setNameSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useStudents({
    name: nameSearch || undefined,
    roomNumber: roomFilter === "all" ? undefined : Number(roomFilter),
  });

  // Use initial data if hooks haven't loaded yet
  const displayStudents = students.length > 0 ? students : initialStudents;

  // Filter students (no status filtering needed)
  const filteredStudents = displayStudents;

  // Get unique room numbers from students for filter
  const roomOptions = useMemo(() => {
    const uniqueRooms = Array.from(
      new Set(displayStudents.map((s) => s.roomNumber))
    ).sort((a, b) => a - b);

    return uniqueRooms.map((roomNumber) => ({
      value: roomNumber.toString(),
      label: `${roomNumber}호`,
    }));
  }, [displayStudents]);

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

      // 목록 새로고침
      await refetchStudents();
      handleCloseModal();
    } catch (error) {
      toast({
        title: modalMode === "create" ? "추가 실패" : "수정 실패",
        description:
          error instanceof Error
            ? error.message
            : `학생 ${
                modalMode === "create" ? "추가" : "수정"
              }에 실패했습니다.`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (isDeleting) return;

    if (!confirm(`${student.name} 학생을 삭제하시겠습니까?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.students.delete(student.studentIdNum);

      toast({
        title: "삭제 완료",
        description: `${student.name} 학생이 삭제되었습니다.`,
      });

      // 목록 새로고침
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

  return (
    <>
      {/* Add Student Button - Floating */}
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddStudent}>
          <Plus className="h-4 w-4 mr-2" />
          학생 추가
        </Button>
      </div>

      <div className="spacing-normal viewport-fill">
        {/* Filters */}
        <Card className="flex-shrink-0">
          <CardHeader className="padding-compact">
            <CardTitle className="flex items-center gap-2 text-responsive-sm">
              <Filter className="h-5 w-5" />
              필터 및 검색
            </CardTitle>
          </CardHeader>
          <CardContent className="padding-compact">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 spacing-compact">
              <div className="space-y-2">
                <Label>학생명 검색</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="학생명 입력..."
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>호실</Label>
                <Select value={roomFilter} onValueChange={setRoomFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="전체 호실" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 호실</SelectItem>
                    {roomOptions.map((room) => (
                      <SelectItem key={room.value} value={room.value}>
                        {room.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>작업</Label>
                <div className="pt-2">
                  <Button onClick={refetchStudents} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    새로고침
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="viewport-fill">
          <CardHeader className="padding-compact flex-shrink-0">
            <CardTitle className="text-responsive-sm">학생 목록</CardTitle>
          </CardHeader>
          <CardContent className="padding-compact viewport-fill-content">
            <StudentListTable
              students={filteredStudents}
              isLoading={studentsLoading}
              error={studentsError}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
            />
          </CardContent>
        </Card>
      </div>

      {/* Student Form Modal */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitStudent}
        student={selectedStudent}
        mode={modalMode}
      />
    </>
  );
}
