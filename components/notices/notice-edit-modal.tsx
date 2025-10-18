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
import { X, MoreHorizontal, Maximize2, Minimize2 } from "lucide-react";

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
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleInputChange = (
    field: keyof EditForm,
    value: string | boolean
  ) => {
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

  const modalStyles = isExpanded
    ? {
        width: "1558px",
        height: "880px",
        top: "100px",
        left: "181px",
        bottom: "auto",
        right: "auto",
      }
    : {
        width: "560px",
        height: "700px",
        bottom: "20px",
        right: "64px",
        top: "auto",
        left: "auto",
      };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="fixed translate-x-0 translate-y-0 max-w-none max-h-none p-0 transition-all duration-300"
        style={{
          ...modalStyles,
          backgroundColor: "var(--color-semantic-background-normal-normal)",
          border: "1px solid var(--color-semantic-line-normal-normal)",
          color: "var(--color-semantic-label-normal)",
        }}
      >
        <DialogHeader
          className="h-[48px] flex flex-row items-center justify-between px-0 py-0 m-0 border-b"
          style={{
            borderBottomColor: "var(--color-semantic-line-normal-normal)",
          }}
        >
          <DialogTitle
            className="pl-8"
            style={{
              color: "var(--color-semantic-label-neutral)",
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: "Pretendard",
              lineHeight: "18.005px",
              letterSpacing: "0.252px",
            }}
          >
            공지 수정 #{notice?.id}
          </DialogTitle>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-8 h-8 p-0 hover:bg-transparent"
              style={{
                color: "var(--color-semantic-label-alternative)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color =
                  "var(--color-semantic-label-neutral)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  "var(--color-semantic-label-alternative)";
              }}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 p-0 hover:bg-transparent"
              style={{
                color: "var(--color-semantic-label-alternative)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color =
                  "var(--color-semantic-label-neutral)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  "var(--color-semantic-label-alternative)";
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 p-0 hover:bg-transparent mr-4"
              style={{
                color: "var(--color-semantic-label-alternative)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color =
                  "var(--color-semantic-label-neutral)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  "var(--color-semantic-label-alternative)";
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto h-[calc(100%-48px)] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label
                htmlFor="edit-title"
                style={{
                  color: "var(--color-semantic-label-normal)",
                  fontSize: "17px",
                  fontWeight: 700,
                  fontFamily: "Pretendard",
                  lineHeight: "24.004px",
                  letterSpacing: "0px",
                }}
              >
                제목
              </Label>
              <Input
                id="edit-title"
                placeholder="제목을 입력하세요"
                value={form.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                maxLength={100}
                className="text-sm 2xl:text-base"
                style={{
                  backgroundColor:
                    "var(--color-semantic-background-normal-alternative)",
                  border: "1px solid var(--color-semantic-line-normal-normal)",
                  color: "var(--color-semantic-label-normal)",
                }}
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
                className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                style={{
                  color: "var(--color-semantic-label-normal)",
                  fontSize: "17px",
                  fontWeight: 700,
                  fontFamily: "Pretendard",
                  lineHeight: "24.004px",
                  letterSpacing: "0px",
                }}
              >
                중요공지
              </Label>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label
                htmlFor="edit-content"
                style={{
                  color: "var(--color-semantic-label-normal)",
                  fontSize: "17px",
                  fontWeight: 700,
                  fontFamily: "Pretendard",
                  lineHeight: "24.004px",
                  letterSpacing: "0px",
                }}
              >
                내용
              </Label>
              <Textarea
                id="edit-content"
                placeholder="공지사항 내용을 입력하세요"
                value={form.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={8}
                maxLength={2000}
                className="text-sm 2xl:text-base"
                style={{
                  backgroundColor:
                    "var(--color-semantic-background-normal-alternative)",
                  border: "1px solid var(--color-semantic-line-normal-normal)",
                  color: "var(--color-semantic-label-normal)",
                }}
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
                style={{
                  borderColor: "var(--color-semantic-line-normal-normal)",
                  color: "var(--color-semantic-label-normal)",
                }}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="text-sm 2xl:text-base h-8 2xl:h-9"
                style={{
                  backgroundColor: "var(--color-semantic-primary-normal)",
                  color: "var(--color-semantic-static-white)",
                }}
              >
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
