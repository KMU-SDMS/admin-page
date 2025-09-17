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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {noticeData.id && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(noticeData.id!)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
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
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
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
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  새창으로 보기
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-4">
            {/* Notice Header */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-balance">
                {noticeData.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {getTargetBadge()}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(noticeData.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>관리자</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notice Body */}
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {noticeData.body}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
