"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Student } from "@/lib/types";

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => Promise<void>;
  student?: Student | null;
  mode: "create" | "edit";
}

export interface StudentFormData {
  name: string;
  studentIdNum: string;
  roomNumber: number;
  checkInDate: string;
}

export function StudentFormModal({
  isOpen,
  onClose,
  onSubmit,
  student,
  mode,
}: StudentFormModalProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    studentIdNum: "",
    roomNumber: 101,
    checkInDate: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof StudentFormData, string>>
  >({});

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (mode === "edit" && student) {
      setFormData({
        name: student.name,
        studentIdNum: student.studentIdNum,
        roomNumber: student.roomNumber,
        checkInDate:
          student.checkInDate || new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        name: "",
        studentIdNum: "",
        roomNumber: 101,
        checkInDate: new Date().toISOString().split("T")[0],
      });
    }
    setErrors({});
  }, [mode, student, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StudentFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }

    if (!formData.studentIdNum.trim()) {
      newErrors.studentIdNum = "학번을 입력해주세요.";
    }

    if (!formData.roomNumber || formData.roomNumber <= 0) {
      newErrors.roomNumber = "유효한 호실 번호를 입력해주세요.";
    }

    if (!formData.checkInDate) {
      newErrors.checkInDate = "입사일을 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // 에러는 부모 컴포넌트에서 처리
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    field: keyof StudentFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "학생 추가" : "학생 정보 수정"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "새로운 학생 정보를 입력해주세요."
              : "학생 정보를 수정해주세요."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* 이름 */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                이름 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="홍길동"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* 학번 */}
            <div className="grid gap-2">
              <Label htmlFor="studentIdNum">
                학번 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="studentIdNum"
                value={formData.studentIdNum}
                onChange={(e) => handleChange("studentIdNum", e.target.value)}
                placeholder="20243105"
                disabled={isSubmitting || mode === "edit"}
              />
              {mode === "edit" && (
                <p className="text-sm text-muted-foreground">
                  학번은 수정할 수 없습니다.
                </p>
              )}
              {errors.studentIdNum && (
                <p className="text-sm text-destructive">
                  {errors.studentIdNum}
                </p>
              )}
            </div>

            {/* 호실 */}
            <div className="grid gap-2">
              <Label htmlFor="roomNumber">
                호실 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="roomNumber"
                type="number"
                value={formData.roomNumber}
                onChange={(e) =>
                  handleChange("roomNumber", parseInt(e.target.value) || 0)
                }
                placeholder="101"
                disabled={isSubmitting}
              />
              {errors.roomNumber && (
                <p className="text-sm text-destructive">{errors.roomNumber}</p>
              )}
            </div>

            {/* 입사일 */}
            <div className="grid gap-2">
              <Label htmlFor="checkInDate">
                입사일 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="checkInDate"
                type="date"
                value={formData.checkInDate}
                onChange={(e) => handleChange("checkInDate", e.target.value)}
                disabled={isSubmitting}
              />
              {errors.checkInDate && (
                <p className="text-sm text-destructive">{errors.checkInDate}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "추가 중..."
                  : "수정 중..."
                : mode === "create"
                ? "추가"
                : "수정"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
