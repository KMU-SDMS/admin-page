"use client";

import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Target, Calendar, User } from "lucide-react";
import type { Room } from "@/lib/types";

interface NoticePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  noticeData: {
    title: string;
    body: string;
    target: "ALL" | "FLOOR" | "ROOM";
    floor?: number;
    roomId?: number;
  };
  rooms: Room[];
  onOpenInNewWindow?: () => void;
}

export function NoticePreviewModal({
  isOpen,
  onClose,
  noticeData,
  rooms,
  onOpenInNewWindow,
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

  const getTargetDisplay = () => {
    if (noticeData.target === "ALL") return "전체";
    if (noticeData.target === "FLOOR") return `${noticeData.floor}층`;
    if (noticeData.target === "ROOM") {
      const room = rooms.find((r) => r.id === noticeData.roomId);
      return room ? room.name : `호실 ${noticeData.roomId}`;
    }
    return noticeData.target;
  };

  const getTargetBadge = () => {
    if (noticeData.target === "ALL")
      return <Badge variant="default">전체</Badge>;
    if (noticeData.target === "FLOOR")
      return <Badge variant="secondary">{noticeData.floor}층</Badge>;
    if (noticeData.target === "ROOM") {
      const room = rooms.find((r) => r.id === noticeData.roomId);
      return (
        <Badge variant="outline">
          {room?.name || `호실 ${noticeData.roomId}`}
        </Badge>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-end">
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
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-4">
            {/* Notice Header */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-balance">
                {noticeData.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>대상: {getTargetDisplay()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>관리자</span>
                </div>
                {getTargetBadge()}
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
