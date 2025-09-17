"use client";

import { RefreshCw, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import type { Notice } from "@/lib/types";

interface RecentNoticesListProps {
  notices: Notice[];
  isLoading: boolean;
  getTargetDisplay: (notice: Notice) => string;
  onRefresh: () => void;
  onNoticeClick?: (notice: Notice) => void;
}

export function RecentNoticesList({
  notices,
  isLoading,
  getTargetDisplay,
  onRefresh,
  onNoticeClick,
}: RecentNoticesListProps) {
  const getTargetBadge = (notice: Notice) => {
    if (notice.is_important)
      return <Badge variant="destructive">중요공지</Badge>;
    return <Badge variant="default">일반공지</Badge>;
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-responsive-base">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">최근 공지사항</span>
            <span className="sm:hidden">공지사항</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <RefreshCw
              className={`h-3 w-3 sm:h-4 sm:w-4 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : notices.length === 0 ? (
          <EmptyState
            title="공지사항이 없습니다"
            description="아직 작성된 공지사항이 없습니다."
            icon={<FileText className="h-8 w-8" />}
            className="py-8"
          />
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {notices.slice(0, 10).map((notice) => (
              <div
                key={notice.id}
                className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onNoticeClick?.(notice)}
              >
                <div className="space-y-2">
                  <h4 className="font-medium line-clamp-2 text-responsive-xs leading-relaxed">
                    {notice.title}
                  </h4>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {getTargetBadge(notice)}
                    </div>
                    <div className="flex items-center gap-1 text-responsive-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="text-responsive-xs">
                        {new Date(notice.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {notice.content && (
                  <div className="text-responsive-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notice.content}
                  </div>
                )}
              </div>
            ))}
            {notices.length > 10 && (
              <div className="text-center text-responsive-xs text-muted-foreground pt-2">
                총 {notices.length}개의 공지사항 중 최근 10개 표시
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
