"use client";

import { useState } from "react";
import { Users, Filter, RefreshCw, Plus, Search } from "lucide-react";
import { Layout } from "@/components/layout";
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
import { useRooms } from "@/hooks/use-rooms";
import { Student } from "@/lib/types";

export default function StudentsPage() {
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
    roomId: roomFilter === "all" ? undefined : roomFilter,
  });

  const { data: rooms } = useRooms();

  // 디버깅을 위한 로그
  console.log("현재 roomFilter:", roomFilter);
  console.log(
    "전달되는 roomId:",
    roomFilter === "all" ? undefined : roomFilter
  );
  console.log("받은 학생 데이터:", students);
  console.log("받은 방 데이터:", rooms);

  // Filter students (no status filtering needed)
  const filteredStudents = students;

  // Get unique room names for filter
  const roomOptions = rooms.map((room) => ({
    value: room.id.toString(),
    label: room.name,
  }));

  // Room data for table component
  const roomData = rooms.map((room) => ({
    id: room.id,
    name: room.name,
  }));

  // Statistics
  const stats = {
    total: students.length,
  };

  const handleEditStudent = (student: Student) => {
    // TODO: 학생 수정 모달 열기
    console.log("Edit student:", student);
  };

  const handleDeleteStudent = (student: Student) => {
    // TODO: 학생 삭제 확인 다이얼로그 열기
    console.log("Delete student:", student);
  };

  const handleBulkDelete = (studentIds: number[]) => {
    // TODO: 다중 삭제 확인 다이얼로그 열기
    console.log("Bulk delete students:", studentIds);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">학생 관리</h1>
            <p className="text-muted-foreground">
              기숙사 학생 정보 관리 및 현황 확인
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            학생 추가
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">전체 학생</span>
              </div>
              <div className="text-2xl font-bold mt-2">{stats.total}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              필터 및 검색
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        <Card>
          <CardHeader>
            <CardTitle>학생 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentListTable
              students={filteredStudents}
              rooms={roomData}
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
    </Layout>
  );
}
