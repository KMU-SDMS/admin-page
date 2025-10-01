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
  isLoading: boolean;
  error: string | null;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

export function StudentListTable({
  students,
  isLoading,
  error,
  onEdit,
  onDelete,
}: StudentListTableProps) {
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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]"></TableHead>
            <TableHead className="2xl:text-base">학번</TableHead>
            <TableHead className="2xl:text-base">이름</TableHead>
            <TableHead className="2xl:text-base">호실</TableHead>
            <TableHead className="text-right 2xl:text-base">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <div className="text-muted-foreground 2xl:text-base">
                  등록된 학생이 없습니다.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="w-[60px]"></TableCell>
                <TableCell className="font-medium 2xl:text-base">
                  {student.studentIdNum}
                </TableCell>
                <TableCell className="2xl:text-base">{student.name}</TableCell>
                <TableCell className="2xl:text-base">
                  {student.roomNumber}호
                </TableCell>
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
