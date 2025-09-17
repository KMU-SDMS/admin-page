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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>공지사항 삭제</AlertDialogTitle>
          <AlertDialogDescription>
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
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
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
