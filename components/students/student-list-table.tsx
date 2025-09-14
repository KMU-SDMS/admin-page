"use client";

import { useState } from "react";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Student } from "@/lib/types";

interface StudentListTableProps {
  students: Student[];
  rooms: Array<{ id: number; name: string }>;
  isLoading: boolean;
  error: string | null;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onBulkDelete?: (studentIds: number[]) => void;
  selectedStudents?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
}

export function StudentListTable({
  students,
  rooms,
  isLoading,
  error,
  onEdit,
  onDelete,
  onBulkDelete,
  selectedStudents = [],
  onSelectionChange,
}: StudentListTableProps) {
  const [selectAll, setSelectAll] = useState(false);

  const getRoomName = (roomId: string) => {
    const room = rooms.find((r) => r.id.toString() === roomId);
    return room ? room.name : `호실 ${roomId}`;
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      onSelectionChange?.(students.map((s) => s.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectStudent = (studentId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedStudents, studentId]);
    } else {
      onSelectionChange?.(selectedStudents.filter((id) => id !== studentId));
    }
  };

  const handleEdit = (student: Student) => {
    onEdit?.(student);
  };

  const handleDelete = (student: Student) => {
    onDelete?.(student);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                aria-label="전체 선택"
              />
            </TableHead>
            <TableHead>학번</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>소속</TableHead>
            <TableHead>호실</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="text-muted-foreground">
                  등록된 학생이 없습니다.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={(checked) =>
                      handleSelectStudent(student.id, checked as boolean)
                    }
                    aria-label={`${student.name} 선택`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {student.studentIdNum}
                </TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{`${student.affiliation || ""} ${
                  student.major || ""
                }`}</TableCell>
                <TableCell>{getRoomName(student.roomId)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(student)}>
                        <Edit className="h-4 w-4 mr-2" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(student)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
