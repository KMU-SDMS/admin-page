"use client";

import type React from "react";

import { useState } from "react";
import { Plus, Award, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { usePoints } from "@/hooks/use-points";
import type { Student, Room } from "@/lib/types";

interface PointsManagementProps {
  students: Student[];
  rooms: Room[];
  isLoading: boolean;
}

export function PointsManagement({
  students,
  rooms,
  isLoading,
}: PointsManagementProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [studentSearch, setStudentSearch] = useState("");
  const [pointForm, setPointForm] = useState({
    type: "" as "MERIT" | "DEMERIT" | "",
    score: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const {
    data: points,
    isLoading: pointsLoading,
    refetch: refetchPoints,
    mutate: mutatePoint,
  } = usePoints(selectedStudentId || undefined);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const selectedStudent = selectedStudentId
    ? students.find((s) => s.id === selectedStudentId)
    : null;

  const handleSubmitPoint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedStudentId ||
      !pointForm.type ||
      !pointForm.score ||
      !pointForm.reason.trim()
    ) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const score = Number.parseInt(pointForm.score);
    if (isNaN(score) || score < 1) {
      toast({
        title: "점수 오류",
        description: "점수는 1 이상의 숫자여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await mutatePoint({
        studentId: selectedStudentId,
        type: pointForm.type,
        score,
        reason: pointForm.reason.trim(),
      });

      toast({
        title: "포인트 부여 완료",
        description: `${selectedStudent?.name} 학생에게 ${
          pointForm.type === "MERIT" ? "상점" : "벌점"
        } ${score}점이 부여되었습니다.`,
      });

      setPointForm({ type: "", score: "", reason: "" });
    } catch (error) {
      toast({
        title: "포인트 부여 실패",
        description:
          error instanceof Error
            ? error.message
            : "포인트 부여에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>학생 목록</CardTitle>
          <SearchInput
            placeholder="학생명 검색..."
            value={studentSearch}
            onChange={setStudentSearch}
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <EmptyState
                title="학생이 없습니다"
                description="검색 조건에 맞는 학생이 없습니다."
              />
            ) : (
              filteredStudents.map((student) => {
                const room = rooms.find((r) => r.id === student.roomId);
                const isSelected = selectedStudentId === student.id;

                return (
                  <div
                    key={student.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedStudentId(student.id)}
                  >
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.studentIdNum} •{" "}
                      {room?.name || `호실 ${student.roomId}`}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Points History & Form */}
      <div className="lg:col-span-2 space-y-6">
        {selectedStudent ? (
          <>
            {/* Points History */}
            <Card>
              <CardHeader>
                <CardTitle>{selectedStudent.name} 학생 포인트 이력</CardTitle>
              </CardHeader>
              <CardContent>
                {pointsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : points.length === 0 ? (
                  <EmptyState
                    title="포인트 이력이 없습니다"
                    description="아직 부여된 상점이나 벌점이 없습니다."
                  />
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>유형</TableHead>
                          <TableHead>점수</TableHead>
                          <TableHead>사유</TableHead>
                          <TableHead>부여일시</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {points.map((point) => (
                          <TableRow key={point.id}>
                            <TableCell>
                              <Badge
                                variant={
                                  point.type === "MERIT"
                                    ? "default"
                                    : "destructive"
                                }
                                className="flex items-center gap-1 w-fit"
                              >
                                {point.type === "MERIT" ? (
                                  <Award className="h-3 w-3" />
                                ) : (
                                  <AlertTriangle className="h-3 w-3" />
                                )}
                                {point.type === "MERIT" ? "상점" : "벌점"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {point.score}점
                            </TableCell>
                            <TableCell>{point.reason}</TableCell>
                            <TableCell>
                              {new Date(point.createdAt).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Point Assignment Form */}
            <Card>
              <CardHeader>
                <CardTitle>포인트 부여</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPoint} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="point-type">유형</Label>
                      <Select
                        value={pointForm.type}
                        onValueChange={(value: "MERIT" | "DEMERIT") =>
                          setPointForm((prev) => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="포인트 유형 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MERIT">상점</SelectItem>
                          <SelectItem value="DEMERIT">벌점</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="point-score">점수</Label>
                      <Input
                        id="point-score"
                        type="number"
                        min="1"
                        placeholder="점수 입력"
                        value={pointForm.score}
                        onChange={(e) =>
                          setPointForm((prev) => ({
                            ...prev,
                            score: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="point-reason">사유</Label>
                    <Textarea
                      id="point-reason"
                      placeholder="포인트 부여 사유를 입력하세요"
                      value={pointForm.reason}
                      onChange={(e) =>
                        setPointForm((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        포인트 부여
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                title="학생을 선택하세요"
                description="좌측 목록에서 학생을 선택하면 포인트 이력과 부여 폼이 표시됩니다."
                icon={<Award className="h-12 w-12" />}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
