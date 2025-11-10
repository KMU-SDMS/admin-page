"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  OvernightStayApplication,
  OvernightStayStatusUpdateRequest,
} from "@/lib/types";

interface OvernightStayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: OvernightStayApplication | null;
  onStatusChangeSuccess?: () => Promise<void> | void;
  onUpdateStatus: (
    payload: OvernightStayStatusUpdateRequest
  ) => Promise<void>;
}

const statusTextMap: Record<
  OvernightStayApplication["status"],
  { label: string; description: string; badge: "default" | "secondary" | "destructive" }
> = {
  pending: {
    label: "검토 대기",
    description: "사감 확인을 기다리고 있습니다.",
    badge: "secondary",
  },
  approved: {
    label: "승인됨",
    description: "사감에 의해 승인되었습니다.",
    badge: "default",
  },
  rejected: {
    label: "거절됨",
    description: "사감에 의해 거절되었습니다.",
    badge: "destructive",
  },
};

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatStayRange(application: OvernightStayApplication | null) {
  if (!application) return "-";
  const out = formatDate(application.startDate);
  const back = formatDate(application.endDate);
  if (out === "-" && back === "-") return "-";
  if (out !== "-" && back !== "-") {
    return `${out} ~ ${back}`;
  }
  return out !== "-" ? out : back;
}

export function OvernightStayDetailModal({
  isOpen,
  onClose,
  application,
  onStatusChangeSuccess,
  onUpdateStatus,
}: OvernightStayDetailModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusChange = async (status: "approved" | "rejected") => {
    if (!application) return;

    try {
      setIsProcessing(true);
      await onUpdateStatus({
        id: application.id,
        status,
      });
      toast.success(
        status === "approved" ? "외박 신청을 승인했습니다." : "외박 신청을 거절했습니다."
      );
      await onStatusChangeSuccess?.();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "처리 중 오류가 발생했습니다.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const statusInfo = application
    ? statusTextMap[application.status] ?? statusTextMap.pending
    : statusTextMap.pending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[640px]"
        style={{
          backgroundColor: "var(--color-semantic-background-normal-normal)",
          color: "var(--color-semantic-label-normal)",
          border: "1px solid var(--color-semantic-line-normal-normal)",
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              color: "var(--color-label-strong)",
              fontSize: "var(--typography-title-3-bold-fontSize)",
              fontWeight: "var(--typography-title-3-bold-fontWeight)",
              lineHeight: "var(--typography-title-3-bold-lineHeight)",
              letterSpacing: "var(--typography-title-3-bold-letterSpacing)",
            }}
          >
            외박 신청 상세
          </DialogTitle>
          <DialogDescription
            className="sr-only"
          >
            외박 신청 세부 정보와 승인/거절 처리를 수행합니다.
          </DialogDescription>
        </DialogHeader>

        {application ? (
          <div className="space-y-6">
            <section className="space-y-3">
              <Badge variant={statusInfo.badge}>{statusInfo.label}</Badge>
              <p className="text-sm text-muted-foreground">
                {statusInfo.description}
              </p>
            </section>

            <section className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">학생 이름</span>
                <p className="font-semibold text-foreground">
                  {application.studentName}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">학번</span>
                <p className="font-semibold text-foreground">
                  {application.studentIdNum}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">신청 학기</span>
                <p className="font-semibold text-foreground">
                  {application.semester || "-"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">호실</span>
                <p className="font-semibold text-foreground">
                  {application.roomNumber ?? "-"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">남은 외박 횟수</span>
                <p className="font-semibold text-foreground">
                  {application.remainingOvernights != null
                    ? `${application.remainingOvernights}회`
                    : "-"}
                </p>
              </div>
            </section>

            <Separator />

            <section className="space-y-2 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">외박 기간</span>
                <p className="font-semibold text-foreground">
                  {formatStayRange(application)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">신청일</span>
                <p className="font-semibold text-foreground">
                  {formatDate(application.createdAt)}
                </p>
              </div>
            </section>

            <Separator />

            <section className="space-y-2">
              <span className="text-sm text-muted-foreground">사유</span>
              <div
                className="p-4 rounded-md"
                style={{
                  backgroundColor: "var(--color-fill-alternative)",
                  color: "var(--color-label-normal)",
                }}
              >
                <p className="text-sm leading-6 whitespace-pre-wrap">
                  {application.reason || "사유가 입력되지 않았습니다."}
                </p>
              </div>
            </section>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            선택된 외박 신청이 없습니다.
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing}
          >
            닫기
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleStatusChange("rejected")}
            disabled={!application || isProcessing}
          >
            {isProcessing ? "처리 중..." : "거절"}
          </Button>
          <Button
            onClick={() => handleStatusChange("approved")}
            disabled={!application || isProcessing}
            style={{
              backgroundColor: "var(--color-semantic-primary-normal)",
              color: "var(--color-semantic-static-white)",
            }}
          >
            {isProcessing ? "처리 중..." : "승인"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

