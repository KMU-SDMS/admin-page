"use client";

import { useState } from "react";
import { Clock, User, Tag, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { InquiryDetailModal } from "./inquiry-detail-modal";
import type { Inquiry } from "@/lib/types";

interface InquiryWithStudent extends Inquiry {
  studentName: string;
}

interface InquiryKanbanBoardProps {
  inquiries: InquiryWithStudent[];
  isLoading: boolean;
  onStatusChange: (
    inquiryId: number,
    newStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED",
  ) => Promise<void>;
}

const statusConfig = {
  OPEN: {
    title: "접수",
    color: "bg-blue-50 border-blue-200",
    badgeVariant: "default" as const,
  },
  IN_PROGRESS: {
    title: "처리중",
    color: "bg-orange-50 border-orange-200",
    badgeVariant: "secondary" as const,
  },
  RESOLVED: {
    title: "완료",
    color: "bg-green-50 border-green-200",
    badgeVariant: "outline" as const,
  },
};

export function InquiryKanbanBoard({
  inquiries,
  isLoading,
  onStatusChange,
}: InquiryKanbanBoardProps) {
  const [selectedInquiry, setSelectedInquiry] =
    useState<InquiryWithStudent | null>(null);

  const getInquiriesByStatus = (status: keyof typeof statusConfig) => {
    return inquiries.filter((inquiry) => inquiry.status === status);
  };

  const getStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    return <Badge variant={config.badgeVariant}>{config.title}</Badge>;
  };

  const getNextStatus = (
    currentStatus: keyof typeof statusConfig,
  ): keyof typeof statusConfig | null => {
    switch (currentStatus) {
      case "OPEN":
        return "IN_PROGRESS";
      case "IN_PROGRESS":
        return "RESOLVED";
      default:
        return null;
    }
  };

  const handleStatusAdvance = async (inquiry: InquiryWithStudent) => {
    const nextStatus = getNextStatus(
      inquiry.status as keyof typeof statusConfig,
    );
    if (nextStatus) {
      await onStatusChange(inquiry.id, nextStatus);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(
          (status) => {
            const statusInquiries = getInquiriesByStatus(status);
            const config = statusConfig[status];

            return (
              <Card key={status} className={config.color}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{config.title}</span>
                    <Badge variant="outline">{statusInquiries.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statusInquiries.length === 0 ? (
                      <EmptyState
                        title="문의가 없습니다"
                        description={`${config.title} 상태의 문의가 없습니다.`}
                        className="py-8"
                      />
                    ) : (
                      statusInquiries.map((inquiry) => (
                        <Card
                          key={inquiry.id}
                          className="cursor-pointer hover:shadow-md transition-shadow bg-background"
                          onClick={() => setSelectedInquiry(inquiry)}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium line-clamp-2 text-sm">
                                  {inquiry.title}
                                </h4>
                                {getStatusBadge(
                                  inquiry.status as keyof typeof statusConfig,
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  <span>{inquiry.category}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{inquiry.studentName}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {new Date(
                                      inquiry.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>

                                {getNextStatus(
                                  inquiry.status as keyof typeof statusConfig,
                                ) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusAdvance(inquiry);
                                    }}
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          },
        )}
      </div>

      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onStatusChange={onStatusChange}
        />
      )}
    </>
  );
}
