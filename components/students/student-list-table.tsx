"use client";

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
            <TableHead className="text-responsive-xs pl-[60px]">학번</TableHead>
            <TableHead className="text-responsive-xs">이름</TableHead>
            <TableHead className="text-responsive-xs">호실</TableHead>
            <TableHead className="text-right text-responsive-xs">
              작업
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <div className="text-muted-foreground">
                  등록된 학생이 없습니다.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium text-responsive-xs pl-[60px]">
                  {student.studentIdNum}
                </TableCell>
                <TableCell className="text-responsive-xs">
                  {student.name}
                </TableCell>
                <TableCell className="text-responsive-xs">
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
