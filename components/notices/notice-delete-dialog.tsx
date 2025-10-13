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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { noticesApi } from "@/lib/api";
import type { Notice } from "@/lib/types";

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

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent
        className="w-[560px] h-[700px] fixed bottom-[20px] right-[64px] top-auto left-auto translate-x-0 translate-y-0 max-w-none max-h-none"
        style={{
          backgroundColor: "var(--color-semantic-background-normal-normal)",
          border: "1px solid var(--color-semantic-line-normal-normal)",
          color: "var(--color-semantic-label-normal)",
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
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
          </AlertDialogTitle>
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
        </AlertDialogHeader>
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
