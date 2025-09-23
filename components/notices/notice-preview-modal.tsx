"use client";

import { useEffect } from "react";
import { ExternalLink, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User } from "lucide-react";

interface NoticePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  noticeData: {
    title: string;
    body: string;
    is_important: boolean;
    date: string;
    id?: number;
  };
  onOpenInNewWindow?: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function NoticePreviewModal({
  isOpen,
  onClose,
  noticeData,
  onOpenInNewWindow,
  onEdit,
  onDelete,
}: NoticePreviewModalProps) {
  // 키보드 접근성 (ESC로 닫기)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const getTargetBadge = () => {
    if (noticeData.is_important)
      return <Badge variant="destructive">중요공지</Badge>;
    return <Badge variant="default">일반공지</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden w-[90vw] sm:w-[80vw] lg:w-[70vw] xl:w-[60vw]">
        <DialogHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {noticeData.id && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(noticeData.id!)}
                  className="flex items-center gap-1 text-sm 2xl:text-base h-8 2xl:h-9"
                >
                  <Edit className="h-3 w-3 2xl:h-4 2xl:w-4" />
                  수정
                </Button>
              )}
              {noticeData.id && onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onDelete(noticeData.id!);
                  }}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950 text-sm 2xl:text-base h-8 2xl:h-9"
                >
                  <Trash2 className="h-3 w-3 2xl:h-4 2xl:w-4" />
                  삭제
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onOpenInNewWindow && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenInNewWindow}
                  className="flex items-center gap-1 text-sm 2xl:text-base h-8 2xl:h-9"
                >
                  <ExternalLink className="h-3 w-3 2xl:h-4 2xl:w-4" />
                  새창으로 보기
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Notice Header */}
            <div className="space-y-4">
              <h2 className="text-lg 2xl:text-2xl font-bold text-balance leading-tight">
                {noticeData.title}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm 2xl:text-base text-muted-foreground">
                <div className="flex items-center gap-2">
                  {getTargetBadge()}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 2xl:h-5 2xl:w-5" />
                  <span>{new Date(noticeData.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 2xl:h-5 2xl:w-5" />
                  <span>관리자</span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Notice Body */}
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-sm 2xl:text-base leading-relaxed">
                {noticeData.body}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
