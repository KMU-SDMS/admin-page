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

  const headerCellStyle: React.CSSProperties = {
    paddingTop: "14px",
    paddingBottom: "14px",
    paddingLeft: "19.5px",
    paddingRight: "19.5px",
    fontSize: "var(--typography-label-1-normal-bold-fontSize)",
    fontWeight: "var(--typography-label-1-normal-bold-fontWeight)" as unknown as number,
    lineHeight: "var(--typography-label-1-normal-bold-lineHeight)",
    letterSpacing: "var(--typography-label-1-normal-bold-letterSpacing)",
    color: "var(--color-label-normal)",
  };

  const rowStyle: React.CSSProperties = {
    height: "76px",
    borderBottom: "none",
  };

  const emptyRowsCount = Math.max(0, 10 - students.length);

  const primaryTextStyle: React.CSSProperties = {
    fontSize: "var(--typography-body-1-normal-bold-fontSize)",
    fontWeight: "var(--typography-body-1-normal-bold-fontWeight)" as unknown as number,
    lineHeight: "var(--typography-body-1-normal-bold-lineHeight)",
    letterSpacing: "var(--typography-body-1-normal-bold-letterSpacing)",
    color: "var(--color-label-normal)",
  };

  const secondaryTextStyle: React.CSSProperties = {
    fontSize: "var(--typography-label-1-normal-medium-fontSize)",
    fontWeight: "var(--typography-label-1-normal-medium-fontWeight)" as unknown as number,
    lineHeight: "var(--typography-label-1-normal-medium-lineHeight)",
    letterSpacing: "var(--typography-label-1-normal-medium-letterSpacing)",
    color: "var(--color-label-alternative)",
  };

  if (isLoading) {
    return (
      <div className="rounded-md overflow-x-auto">
        <Table>
          <TableBody>
            <TableRow style={rowStyle}>
              <TableCell colSpan={7} className="text-center">
                <LoadingSpinner />
              </TableCell>
            </TableRow>
            {Array.from({ length: 9 }, (_, i) => (
              <TableRow key={`empty-loading-${i}`} style={rowStyle}>
                <TableCell colSpan={7}></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow style={{ height: "80px", borderBottom: "none" }}>
            <TableHead className="w-[60px]" style={headerCellStyle}></TableHead>
            <TableHead className="2xl:text-base" style={headerCellStyle}>
              학번
            </TableHead>
            <TableHead className="2xl:text-base" style={headerCellStyle}>
              이름
            </TableHead>
            <TableHead className="2xl:text-base" style={headerCellStyle}>
              호실
            </TableHead>
            <TableHead className="2xl:text-base" style={headerCellStyle}>
              입사일
            </TableHead>
            <TableHead className="2xl:text-base" style={headerCellStyle}>
              퇴사일
            </TableHead>
            <TableHead className="text-right 2xl:text-base" style={headerCellStyle}>
              작업
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <>
              <TableRow style={rowStyle}>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  등록된 학생이 없습니다.
                </TableCell>
              </TableRow>
              {Array.from({ length: 9 }, (_, i) => (
                <TableRow key={`empty-${i}`} style={rowStyle}>
                  <TableCell colSpan={7}></TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            <>
              {students.map((student) => (
                <TableRow key={student.studentIdNum} style={rowStyle}>
                  <TableCell className="w-[60px]"></TableCell>
                  <TableCell>
                    <div style={primaryTextStyle}>{student.studentIdNum}</div>
                  </TableCell>
                  <TableCell>
                    <div style={primaryTextStyle}>{student.name}</div>
                  </TableCell>
                  <TableCell>
                    <div style={secondaryTextStyle}>{student.roomNumber}호</div>
                  </TableCell>
                  <TableCell>
                    <div style={secondaryTextStyle}>
                      {student.checkInDate || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={secondaryTextStyle}>
                      {student.checkOutDate || "-"}
                    </div>
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
              ))}
              {Array.from({ length: emptyRowsCount }, (_, i) => (
                <TableRow key={`empty-fill-${i}`} style={rowStyle}>
                  <TableCell colSpan={7}></TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
