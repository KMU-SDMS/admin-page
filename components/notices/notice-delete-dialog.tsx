"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { noticesApi } from "@/lib/api";
import type { Notice } from "@/lib/types";
import { X, MoreHorizontal, Maximize2, Minimize2 } from "lucide-react";

interface NoticeDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  notice: Notice | null;
  onSuccess: () => void;
}

export function NoticeDeleteDialog({
  isOpen,
  onClose,
  notice,
  onSuccess,
}: NoticeDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { toast } = useToast();

  const handleDelete = async () => {
    if (!notice) return;

    setIsDeleting(true);

    try {
      const result = await noticesApi.delete(notice.id);

      toast({
        title: "공지 삭제 완료",
        description: "공지사항이 성공적으로 삭제되었습니다.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "공지 삭제 실패",
        description:
          error instanceof Error ? error.message : "공지 삭제에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent
        className="fixed translate-x-0 translate-y-0 max-w-none max-h-none p-0 transition-all duration-300"
        style={{
          ...modalStyles,
          backgroundColor: "var(--color-semantic-background-normal-normal)",
          border: "1px solid var(--color-semantic-line-normal-normal)",
          color: "var(--color-semantic-label-normal)",
        }}
      >
        <AlertDialogHeader
          className="h-[48px] flex flex-row items-center justify-between px-0 py-0 m-0 border-b"
          style={{
            borderBottomColor: "var(--color-semantic-line-normal-normal)",
          }}
        >
          <AlertDialogTitle
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
            {notice?.id && `공지 #${notice.id}`}
          </AlertDialogTitle>
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
        </AlertDialogHeader>
        <div className="p-6">
          <div className="space-y-4">
            <div
              style={{
                color: "var(--color-semantic-label-normal)",
                fontSize: "17px",
                fontWeight: 700,
                fontFamily: "Pretendard",
                lineHeight: "24.004px",
                letterSpacing: "0px",
              }}
            >
              공지사항 삭제
            </div>
            <AlertDialogDescription
              style={{
                color: "var(--color-semantic-label-neutral)",
                fontSize: "15px",
                fontWeight: 500,
                fontFamily: "Pretendard",
                lineHeight: "24px",
                letterSpacing: "0.144px",
              }}
            >
              정말로 이 공지사항을 삭제하시겠습니까?
              <br />
              <br />
              <strong>제목:</strong> {notice?.title}
              <br />
              <br />
              삭제된 공지사항은 복구할 수 없습니다.
            </AlertDialogDescription>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className="text-sm 2xl:text-base h-8 2xl:h-9"
            style={{
              borderColor: "var(--color-semantic-line-normal-normal)",
              color: "var(--color-semantic-label-normal)",
            }}
          >
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm 2xl:text-base h-8 2xl:h-9"
            style={{
              backgroundColor: "var(--color-semantic-status-negative)",
              color: "var(--color-semantic-static-white)",
            }}
          >
            {isDeleting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                삭제 중...
              </>
            ) : (
              "삭제"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
