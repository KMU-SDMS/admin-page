"use client";

import { useState, useMemo } from "react";
import { Filter, RefreshCw, Search } from "lucide-react";
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
import { useStudents } from "@/hooks/use-students";
import { Student } from "@/lib/types";

interface StudentsPageClientProps {
  initialStudents: Student[];
}

export function StudentsPageClient({
  initialStudents,
}: StudentsPageClientProps) {
  const [nameSearch, setNameSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

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

  const handleEditStudent = (student: Student) => {
    // TODO: 학생 수정 모달 열기
  };

  const handleDeleteStudent = (student: Student) => {
    // TODO: 학생 삭제 확인 다이얼로그 열기
  };

  const handleBulkDelete = (studentIds: number[]) => {
    // TODO: 다중 삭제 확인 다이얼로그 열기
  };

  return (
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
            onBulkDelete={handleBulkDelete}
            selectedStudents={selectedStudents}
            onSelectionChange={setSelectedStudents}
          />
        </CardContent>
      </Card>
    </div>
  );
}
