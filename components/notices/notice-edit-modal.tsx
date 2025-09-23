"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import type { Notice } from "@/lib/types";
import { noticesApi } from "@/lib/api";

interface NoticeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: Notice | null;
  onSuccess: () => void;
}

interface EditForm {
  title: string;
  content: string;
  is_important: boolean;
}

export function NoticeEditModal({
  isOpen,
  onClose,
  notice,
  onSuccess,
}: NoticeEditModalProps) {
  const [form, setForm] = useState<EditForm>({
    title: "",
    content: "",
    is_important: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // 폼 초기화
  useEffect(() => {
    if (notice) {
      setForm({
        title: notice.title,
        content: notice.content,
        is_important: notice.is_important,
      });
    }
  }, [notice]);

  const handleInputChange = (field: keyof EditForm, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!notice) return;

    setIsSubmitting(true);

    try {
      await noticesApi.update({
        id: notice.id,
        title: form.title.trim(),
        content: form.content.trim(),
        is_important: form.is_important,
      });

      toast({
        title: "공지 수정 완료",
        description: "공지사항이 성공적으로 수정되었습니다.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "공지 수정 실패",
        description:
          error instanceof Error ? error.message : "공지 수정에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = form.title.trim() && form.content.trim();

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-sm 2xl:text-base">공지사항 수정</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-sm 2xl:text-base">제목</Label>
              <Input
                id="edit-title"
                placeholder="제목을 입력하세요"
                value={form.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                maxLength={100}
                className="text-sm 2xl:text-base"
              />
            </div>

            {/* Important Notice Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_important"
                checked={form.is_important}
                onCheckedChange={(checked) =>
                  handleInputChange("is_important", checked)
                }
              />
              <Label
                htmlFor="edit-is_important"
                className="text-sm 2xl:text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                중요공지
              </Label>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="edit-content" className="text-sm 2xl:text-base">내용</Label>
              <Textarea
                id="edit-content"
                placeholder="공지사항 내용을 입력하세요"
                value={form.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={8}
                maxLength={2000}
                className="text-sm 2xl:text-base"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-sm 2xl:text-base h-8 2xl:h-9"
              >
                취소
              </Button>
              <Button type="submit" disabled={!isFormValid || isSubmitting} className="text-sm 2xl:text-base h-8 2xl:h-9">
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    수정 중...
                  </>
                ) : (
                  "수정 완료"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
