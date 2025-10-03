"use client";

import { useState } from "react";
import { RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useStudents();

  // Use initial data if hooks haven't loaded yet
  const displayStudents = students.length > 0 ? students : initialStudents;

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchStudents();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <div className="spacing-normal viewport-fill">
        {/* Students Table */}
        <Card className="viewport-fill">
          <CardHeader className="padding-compact flex-shrink-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-responsive-sm">학생 목록</CardTitle>
              <div className="flex gap-2">
                <Button onClick={handleAddStudent} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  학생 추가
                </Button>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="padding-compact viewport-fill-content">
            <StudentListTable
              students={displayStudents}
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
